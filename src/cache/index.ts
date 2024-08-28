import { LocalCache } from './local';
import { SQLiteCache } from './sqlite';
import { RedisCache } from './redis';
import { MemoryCache } from './memory';
import type { Cache } from './types';

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

export * from './types';
export * from './utils';
export * from './local';
export * from './memory';
export * from './redis';
export * from './sqlite';
export * from './upstash';
