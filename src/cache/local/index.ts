import { readFile, writeFile } from 'node:fs/promises';
import { MemoryCache } from '../memory';
import type { Cache, CacheItem, GetCacheInfo, PutCacheInfo } from '../types';

export class LocalCache implements Cache {
    private store = new MemoryCache();
    private readonly path: string;

    constructor(path: string) {
        this.path = path;
        this.readFromDisk().then(() => console.log('Cache loaded'));
    }

    async get(key: string, info?: GetCacheInfo): Promise<CacheItem | null> {
        return this.store.get(key, info);
    }

    async put(key: string, value: CacheItem, info?: PutCacheInfo): Promise<void> {
        await this.store.put(key, value, info);
        return this.writeToDisk();
    }

    async delete(key: string): Promise<void> {
        await this.store.delete(key);
        return this.writeToDisk();
    }

    async list(prefix?: string, limit?: number): Promise<string[]> {
        return this.store.list(prefix, limit);
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
