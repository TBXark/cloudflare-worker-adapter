import { readFile, writeFile } from 'node:fs/promises';
import type { Cache, CacheInfo, CacheItem } from './cache.ts';
import { MemoryCache } from './memory.ts';

export class LocalCache implements Cache {
    private store = new MemoryCache();
    private readonly path: string;

    constructor(path: string) {
        this.path = path;
        this.readFromDisk().then(() => console.log('Cache loaded'));
    }

    async get(key: string, info?: CacheInfo): Promise<CacheItem | null> {
        return this.store.get(key, info);
    }

    async put(key: string, value: CacheItem, info?: CacheInfo): Promise<void> {
        await this.store.put(key, value, info);
        return this.writeToDisk();
    }

    async delete(key: string): Promise<void> {
        await this.store.delete(key);
        return this.writeToDisk();
    }

    async readFromDisk() {
        try {
            const data = await readFile(this.path, 'utf-8');
            this.store.restoreFromString(data);
        } catch (e) {
            console.error('Failed to read cache from disk', e);
        }
    }

    writeToDisk(): Promise<void> {
        return writeFile(this.path, this.store.toString());
    }
}
