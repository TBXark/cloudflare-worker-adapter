import { LocalCache } from './local.js';
import { SqliteCache } from './sqlite.js';
import { RedisCache } from './redis.js';
import { MemoryCache } from './memory.js';

/**
 * @param {string} type
 * @param {object} options
 * @returns {Promise<MemoryCache|LocalCache|SqliteCache|RedisCache>}
 */
export async function createCache(type, options) {
    switch (options?.type) {
        case 'local':
            return new LocalCache(options.uri);
        case 'sqlite':
            return new SqliteCache(options.uri);
        case 'redis':
            return new RedisCache(options.uri);
        default:
            return new MemoryCache();
    }
}