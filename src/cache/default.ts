import type {Cache} from "./cache.ts";
import {LocalCache} from "./local.ts";
import {SQLiteCache} from "./sqlite.ts";
import {RedisCache} from "./redis.ts";
import {MemoryCache} from "./memory.ts";

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