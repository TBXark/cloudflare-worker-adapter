import type { ReadableStream } from 'node:stream/web';

export type CacheItem = string | object | ArrayBuffer | ReadableStream;
export type CacheType = 'string' | 'text' | 'json' | 'arrayBuffer' | 'stream';

export interface CacheInfo {
    type: CacheType;
    expiration?: number;
    expirationTtl?: number;
}

export interface CacheStore {
    info: CacheInfo;
    value: string;
}

export interface Cache {
    get: (key: string, info?: CacheInfo) => Promise<CacheItem | null>;
    put: (key: string, value: CacheItem, info?: CacheInfo) => Promise<void>;
    delete: (key: string) => Promise<void>;
    list?: (prefix?: string, limit?: number) => Promise<string[]>;
}
