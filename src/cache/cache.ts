import { Buffer } from 'node:buffer';

export type CacheItem = string | object | ArrayBuffer;

export type CacheType = 'string' | 'json' | 'arrayBuffer';

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
}

export function decodeCacheItem(value: string, type?: CacheType): CacheItem {
    switch (type) {
        case 'string':
            return value;
        case 'json':
            return JSON.parse(value);
        case 'arrayBuffer':
            return Buffer.from(value, 'base64');
        default:
            return value;
    }
}

export function encodeCacheItem(value: CacheItem): string {
    if (typeof value === 'string') {
        return value;
    } else if (value instanceof ArrayBuffer) {
        return Buffer.from(value).toString('base64');
    } else if (typeof value === 'object') {
        return JSON.stringify(value);
    } else {
        return String(value);
    }
}
