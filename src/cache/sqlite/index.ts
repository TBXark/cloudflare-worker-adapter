import type { Database, Statement } from 'sqlite3';
import sqlite3 from 'sqlite3';
import { cacheItemToType, decodeCacheItem, encodeCacheItem } from '../utils/cache';

import type { Cache, CacheInfo, CacheItem, CacheType } from '../types/types';

interface CacheRow {
    id: number;
    key: string;
    value: string;
    type: string;
    expiration: number;
}

export class SQLiteCache implements Cache {
    private db?: Database;
    private readonly tableName: string;
    private getStatement?: Statement;
    private upsertStatement?: Statement;
    private deleteStatement?: Statement;
    private listStatement?: Statement;
    private listNoLimitStatement?: Statement;

    constructor(dbPath: string, tableName: string = 'CACHES_v2') {
        this.tableName = tableName;
        this.initializeDatabase(dbPath);
    }

    private initializeDatabase(dbPath: string) {
        const create = `CREATE TABLE IF NOT EXISTS ${this.tableName} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key VARCHAR(100) NOT NULL UNIQUE,
            value TEXT,
            type VARCHAR(10),
            expiration INTEGER
        )`;
        const get = `SELECT * FROM ${this.tableName} WHERE key = ?`;
        const upt = `INSERT INTO ${this.tableName} (key, value, type, expiration) VALUES (?, ?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = ?, type = ?, expiration = ?`;
        const del = `DELETE FROM ${this.tableName} WHERE key = ?`;
        const list = `SELECT key FROM ${this.tableName} WHERE key LIKE ? LIMIT ?`;
        const listNoLimit = `SELECT key FROM ${this.tableName} WHERE key LIKE ?`;

        this.db = new sqlite3.Database(dbPath);
        this.db.serialize(() => {
            this.db?.run(create);
            this.getStatement = this.db?.prepare(get);
            this.upsertStatement = this.db?.prepare(upt);
            this.deleteStatement = this.db?.prepare(del);
            this.listStatement = this.db?.prepare(list);
            this.listNoLimitStatement = this.db?.prepare(listNoLimit);
            this.db?.run('PRAGMA journal_mode = WAL');
            this.db?.run(`CREATE INDEX IF NOT EXISTS idx_${this.tableName}_key ON ${this.tableName}(key)`);
        });
    }

    async get(key: string, info?: CacheInfo): Promise<CacheItem | null> {
        const row = await new Promise<CacheRow | undefined>((resolve, reject) => {
            this.getStatement?.get<CacheRow>(key, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
        if (!row) {
            return null;
        }

        const expiration = row.expiration;
        if (expiration && expiration < Date.now()) {
            await this.delete(key);
            return null;
        }

        return decodeCacheItem(row.value, info?.type || row.type as CacheType);
    }

    private calculateExpiration(info?: CacheInfo): number | null {
        if (info?.expiration) {
            return info.expiration;
        }
        if (info?.expirationTtl) {
            return Date.now() + info.expirationTtl;
        }
        return null;
    }

    async put(key: string, value: CacheItem, info?: CacheInfo): Promise<void> {
        const row = {
            key,
            value: await encodeCacheItem(value),
            type: info?.type || cacheItemToType(value),
            expiration: this.calculateExpiration(info),
        };

        await new Promise<void>((resolve, reject) => {
            this.upsertStatement?.run(
                row.key,
                row.value,
                row.type,
                row.expiration,
                row.value,
                row.type,
                row.expiration,
                (err: Error | any) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                },
            );
        });
    }

    async delete(key: string): Promise<void> {
        await new Promise<void>((resolve, reject) => {
            this.deleteStatement?.run(key, (err: Error | any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    async list(prefix?: string, limit?: number): Promise<string[]> {
        if (limit === undefined || limit == null) {
            return new Promise<string[]>((resolve, reject) => {
                this.listNoLimitStatement?.all<CacheRow>([`${prefix || ''}%`], (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row ? row.map(r => r.key) : []);
                    }
                });
            });
        }
        return new Promise<string[]>((resolve, reject) => {
            this.listStatement?.all<CacheRow>([`${prefix || ''}%`, limit], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row ? row.map(r => r.key) : []);
                }
            });
        });
    }

    async close() {
        await new Promise<void>((resolve, reject) => {
            this.getStatement?.finalize();
            this.upsertStatement?.finalize();
            this.deleteStatement?.finalize();
            this.db?.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}
