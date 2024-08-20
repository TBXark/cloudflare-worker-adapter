import type { RedisOptions } from 'ioredis';
import { Redis } from 'ioredis';
import { cacheItemToType, decodeCacheItem, encodeCacheItem } from '../utils/cache';
import type { Cache, CacheInfo, CacheItem, CacheStore } from '../types/types';

export class RedisCache implements Cache {
    private redis: Redis;

    constructor(redis: Redis) {
        this.redis = redis;
    }

    static create(options: RedisOptions): RedisCache {
        return new RedisCache(new Redis(options));
    }

    static createFromUri(uri: string): RedisCache {
        return new RedisCache(new Redis(uri));
    }

    async get(key: string, info?: CacheInfo): Promise<CacheItem | null> {
        const result = await this.redis.get(key);
        if (!result)
            return null;

        const item: CacheStore = JSON.parse(result);
        return decodeCacheItem(item.value, info?.type || item.info.type);
    }

    async put(key: string, value: CacheItem, info?: CacheInfo): Promise<void> {
        const cacheStore: CacheStore = {
            info: info || {
                type: cacheItemToType(value),
            },
            value: encodeCacheItem(value),
        };

        if (cacheStore.info.expirationTtl) {
            await this.redis.set(key, JSON.stringify(cacheStore), 'EX', cacheStore.info.expirationTtl);
        } else if (cacheStore.info.expiration) {
            const ttl = Math.floor((cacheStore.info.expiration - Date.now()) / 1000);
            await this.redis.set(key, JSON.stringify(cacheStore), 'EX', ttl > 0 ? ttl : 0);
        } else {
            await this.redis.set(key, JSON.stringify(cacheStore));
        }
    }

    async delete(key: string): Promise<void> {
        await this.redis.del(key);
    }

    async close() {
        await this.redis.quit();
    }
}
