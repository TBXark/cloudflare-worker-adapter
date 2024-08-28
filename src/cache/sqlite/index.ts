import type { Database, Statement } from 'sqlite3';
import sqlite3 from 'sqlite3';
import { cacheItemToType, calculateExpiration, createSQLCacheStmt, decodeCacheItem, encodeCacheItem } from '../utils';
import type { Cache, CacheItem, CacheType, GetCacheInfo, PutCacheInfo } from '../types';
import type { SQLCacheRow } from '../utils';

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
        const stmt = createSQLCacheStmt(this.tableName);
        this.db = new sqlite3.Database(dbPath);
        this.db.serialize(() => {
            this.db?.run(stmt.create);
            this.getStatement = this.db?.prepare(stmt.get);
            this.upsertStatement = this.db?.prepare(stmt.upsert);
            this.deleteStatement = this.db?.prepare(stmt.delete);
            this.listStatement = this.db?.prepare(stmt.list);
            this.listNoLimitStatement = this.db?.prepare(stmt.listNoLimit);
            // this.db?.run('PRAGMA journal_mode = WAL');
            this.db?.run(`CREATE INDEX IF NOT EXISTS idx_${this.tableName}_key ON ${this.tableName}(key)`);
        });
    }

    async get(key: string, info?: GetCacheInfo): Promise<CacheItem | null> {
        const row = await new Promise<SQLCacheRow | undefined>((resolve, reject) => {
            this.getStatement?.get<SQLCacheRow>(key, (err, row) => {
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
        if (expiration !== -1 && expiration < Date.now()) {
            await this.delete(key);
            return null;
        }
        return decodeCacheItem(row.value, info?.type || row.type as CacheType);
    }

    async put(key: string, value: CacheItem, info?: PutCacheInfo): Promise<void> {
        const row = {
            key,
            value: await encodeCacheItem(value),
            type: cacheItemToType(value),
            expiration: calculateExpiration(info) ?? -1,
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
                this.listNoLimitStatement?.all<SQLCacheRow>([`${prefix || ''}%`], (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row ? row.map(r => r.key) : []);
                    }
                });
            });
        }
        return new Promise<string[]>((resolve, reject) => {
            this.listStatement?.all<SQLCacheRow>([`${prefix || ''}%`, limit], (err, row) => {
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
