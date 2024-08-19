import type { AsyncStatement } from 'promised-sqlite3';
import { AsyncDatabase } from 'promised-sqlite3';
import { decodeCacheItem } from './cache.ts';
import type { Cache, CacheInfo, CacheItem, CacheType } from './cache.ts';

interface CacheRow {
    key: string;
    value: string;
    type: string;
    expiration: number;
}

export class SQLiteCache implements Cache {
    private db?: AsyncDatabase;
    private tableName: string;
    private getStatement?: AsyncStatement;
    private putStatement?: AsyncStatement;
    private deleteStatement?: AsyncStatement;

    constructor(dbPath: string, tableName: string = 'CACHES') {
        this.tableName = tableName;
        this.initializeDatabase(dbPath).then(() => console.log('Database initialized'));
    }

    private async initializeDatabase(dbPath: string) {
        this.db = await AsyncDatabase.open(dbPath);

        await this.db.exec(`
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        key TEXT PRIMARY KEY,
        value TEXT,
        type TEXT,
        expiration INTEGER
      )
    `);

        this.getStatement = await this.db.prepare(`SELECT * FROM ${this.tableName} WHERE key = ?`);
        this.putStatement = await this.db.prepare(`INSERT OR REPLACE INTO ${this.tableName} (key, value, type, expiration) VALUES (?, ?, ?, ?)`);
        this.deleteStatement = await this.db.prepare(`DELETE FROM ${this.tableName} WHERE key = ?`);
    }

    async get(key: string, info?: CacheInfo): Promise<CacheItem | null> {
        const row = await this.getStatement?.get<CacheRow>(key);
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
            value: value.toString(),
            type: info?.type || 'string',
            expiration: this.calculateExpiration(info),
        };

        try {
            await this.putStatement?.run(row.key, row.value, row.type, row.expiration);
        } catch (e) {
            console.error('Failed to put cache item', e);
        }
    }

    async delete(key: string): Promise<void> {
        await this.deleteStatement?.run(key);
    }
}
