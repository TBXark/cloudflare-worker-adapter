import type { ReadableStream } from 'node:stream/web';

export type CacheItem = string | object | ArrayBuffer | ReadableStream | null;
export type CacheType = 'string' | 'text' | 'json' | 'arrayBuffer' | 'stream';

export interface CacheInfo {
    type: CacheType;
    expiration?: number;
}

export interface GetCacheInfo {
    type: CacheType;
}

export interface PutCacheInfo {
    expiration?: number;
    expirationTtl?: number;
}

export interface CacheStore {
    info: CacheInfo;
    value: string;
}

export interface Cache {
    get: (key: string, info?: GetCacheInfo) => Promise<CacheItem | null>;
    put: (key: string, value: CacheItem, info?: PutCacheInfo) => Promise<void>;
    delete: (key: string) => Promise<void>;
    list?: (prefix?: string, limit?: number) => Promise<string[]>;
}
