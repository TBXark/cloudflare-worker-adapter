import { cacheItemToType, decodeCacheItem, encodeCacheItem } from '../utils/cache';
import type { Cache, CacheInfo, CacheItem, CacheStore } from '../types/types';

export class MemoryCache implements Cache {
    private cache: Record<string, CacheStore>;

    constructor(store: Record<string, CacheStore> = {}) {
        this.cache = store;
    }

    async get(key: string, info?: CacheInfo): Promise<CacheItem | null> {
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

    put(key: string, value: CacheItem, info?: CacheInfo): Promise<void> {
        this.cache[key] = {
            info: info || {
                type: cacheItemToType(value),
            },
            value: encodeCacheItem(value),
        };
        return Promise.resolve();
    }

    delete(key: string): Promise<void> {
        delete this.cache[key];
        return Promise.resolve();
    }

    toString(): string {
        return JSON.stringify(this.cache);
    }

    restoreFromString(data: string) {
        this.cache = JSON.parse(data);
    }
}
