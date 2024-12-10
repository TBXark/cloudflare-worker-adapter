import type { Cache } from './types';
import { LocalCache } from './local';
import { MemoryCache } from './memory';
import { RedisCache } from './redis';
import { SQLiteCache } from './sqlite';

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

export * from './d1';
export * from './local';
export * from './memory';
export * from './redis';
export * from './sqlite';
export * from './types';
export * from './upstash';
export * from './utils';
