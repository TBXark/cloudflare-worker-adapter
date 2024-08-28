import type { D1Database, D1PreparedStatement } from '@cloudflare/workers-types';
import type { Cache, CacheItem, GetCacheInfo, PutCacheInfo } from '../types';
import type { SQLCacheRow } from '../utils';
import { cacheItemToType, calculateExpiration, createSQLCacheStmt, decodeCacheItem, encodeCacheItem } from '../utils';

export class D1Cache implements Cache {
    private readonly store: D1Database;
    private readonly tableName: string;
    private getStatement?: D1PreparedStatement;
    private upsertStatement?: D1PreparedStatement;
    private deleteStatement?: D1PreparedStatement;
    private listStatement?: D1PreparedStatement;
    private listNoLimitStatement?: D1PreparedStatement;

    constructor(store: D1Database) {
        this.store = store;
    }

    async initializeDatabase() {
        const stmt = createSQLCacheStmt(this.tableName);
        await this.store.exec(stmt.create);
        this.getStatement = this.store.prepare(stmt.get);
        this.upsertStatement = this.store.prepare(stmt.upsert);
        this.deleteStatement = this.store.prepare(stmt.delete);
        this.listStatement = this.store.prepare(stmt.list);
        this.listNoLimitStatement = this.store.prepare(stmt.listNoLimit);
    }

    async get(key: string, info?: GetCacheInfo): Promise<CacheItem | null> {
        const item = await this.getStatement.bind(key).first<SQLCacheRow>();
        if (!item) {
            return null;
        }
        if (item.expiration !== -1 && item.expiration < Date.now()) {
            await this.delete(key);
            return null;
        }
        return decodeCacheItem(item.value, info?.type);
    }

    async put(key: string, value: CacheItem, info?: PutCacheInfo): Promise<void> {
        const row: SQLCacheRow = {
            key,
            value: await encodeCacheItem(value),
            type: cacheItemToType(value),
            expiration: calculateExpiration(info) || -1,
        };
        await this.upsertStatement.bind(row.key, row.value, row.type, row.expiration, row.value, row.type, row.expiration).run();
    }

    async delete(key: string): Promise<void> {
        await this.deleteStatement.bind(key).run();
    }

    async list(prefix?: string, limit?: number): Promise<string[]> {
        if (limit === null || limit === undefined) {
            return this.listNoLimitStatement.bind(prefix).all<SQLCacheRow>().then((res) => {
                return res.results.map(row => row.key);
            });
        } else {
            return this.listStatement.bind(prefix, limit).all<SQLCacheRow>().then((res) => {
                return res.results.map(row => row.key);
            });
        }
    }
}
