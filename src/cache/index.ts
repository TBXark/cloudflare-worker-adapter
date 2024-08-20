import { LocalCache } from './local';
import { SQLiteCache } from './sqlite';
import { RedisCache } from './redis';
import { MemoryCache } from './memory';
import type { Cache } from './types/types';

export interface CacheOptions {
    uri: string;
}

export function createCache(type: string, options: CacheOptions): Cache {
    switch (type) {
        case 'local':
            return new LocalCache(options.uri);
        case 'sqlite':
            return new SQLiteCache(options.uri);
        case 'redis':
            return RedisCache.createFromUri(options.uri);
        default:
            return new MemoryCache();
    }
}

export * from './types/types';
export * from './utils/cache';
export * from './local';
export * from './memory';
export * from './redis';
export * from './sqlite';
