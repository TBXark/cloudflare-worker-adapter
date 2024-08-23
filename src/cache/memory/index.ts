import { cacheItemToType, calculateExpiration, decodeCacheItem, encodeCacheItem } from '../utils';
import type { Cache, CacheItem, CacheStore, GetCacheInfo, PutCacheInfo } from '../types';

export class MemoryCache implements Cache {
    private cache: Record<string, CacheStore>;

    constructor(store: Record<string, CacheStore> = {}) {
        this.cache = store;
    }

    async get(key: string, info?: GetCacheInfo): Promise<CacheItem | null> {
        const item = this.cache[key];
        if (!item) {
            return null;
        }

        if (item.info.expiration && item.info.expiration < Date.now()) {
            await this.delete(key);
            return null;
        }
        return decodeCacheItem(item.value, info?.type || item.info.type);
    }

    async put(key: string, value: CacheItem, info?: PutCacheInfo): Promise<void> {
        this.cache[key] = {
            info: {
                type: cacheItemToType(value),
                expiration: calculateExpiration(info),
            },
            value: await encodeCacheItem(value),
        };
        return Promise.resolve();
    }

    async list(prefix?: string, limit?: number): Promise<string[]> {
        const res: string[] = [];
        for (const key in this.cache) {
            if (!prefix || key.startsWith(prefix)) {
                res.push(key);
            }
            if (limit && res.length >= limit) {
                break;
            }
        }
        return Promise.resolve(res);
    }

    async delete(key: string): Promise<void> {
        delete this.cache[key];
        return Promise.resolve();
    }

    private trimCache() {
        for (const key in this.cache) {
            const item = this.cache[key];
            if (item.info.expiration && item.info.expiration < Date.now()) {
                delete this.cache[key];
            }
        }
    }

    toString(): string {
        this.trimCache();
        return JSON.stringify(this.cache, null, 2);
    }

    restoreFromString(data: string) {
        this.cache = JSON.parse(data);
    }
}
