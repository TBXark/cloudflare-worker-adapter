import path from 'node:path';
import * as fs from 'node:fs';
import { UpStashRedis } from './index';

const {
    UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN,
} = JSON.parse(fs.readFileSync(path.resolve('./config.json'), 'utf-8'));

const cache = UpStashRedis.create(UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN);
console.log(`database: redis is ready`);

(async () => {
    await cache.put('key', 'value', {
        expiration: Date.now() + 1000 * 60 * 60 * 24,
    });
    console.log(await cache.get('key'));
    await cache.delete('key');
    console.log(await cache.get('key'));
    console.log(await cache.list());
})();
