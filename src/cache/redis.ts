import { Buffer } from 'node:buffer';
import type { RedisOptions } from 'ioredis';
import { Redis } from 'ioredis';
import type { Cache, CacheInfo, CacheItem, CacheStore } from './cache.ts';
import { decodeCacheItem } from './cache.ts';

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
        const cacheInfo: CacheInfo = info || { type: 'string' };
        let stringValue: string;

        switch (cacheInfo.type) {
            case 'string':
                stringValue = value as string;
                break;
            case 'json':
                stringValue = JSON.stringify(value);
                break;
            case 'arrayBuffer':
                stringValue = Buffer.from(value as ArrayBuffer).toString('base64');
                break;
            default:
                throw new Error('Unsupported cache type');
        }

        const cacheStore: CacheStore = {
            info: cacheInfo,
            value: stringValue,
        };

        if (cacheInfo.expirationTtl) {
            await this.redis.set(key, JSON.stringify(cacheStore), 'EX', cacheInfo.expirationTtl);
        } else if (cacheInfo.expiration) {
            const ttl = Math.floor((cacheInfo.expiration - Date.now()) / 1000);
            await this.redis.set(key, JSON.stringify(cacheStore), 'EX', ttl > 0 ? ttl : 0);
        } else {
            await this.redis.set(key, JSON.stringify(cacheStore));
        }
    }

    async delete(key: string): Promise<void> {
        await this.redis.del(key);
    }
}
