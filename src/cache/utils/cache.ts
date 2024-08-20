import { Buffer } from 'node:buffer';
import type { CacheItem, CacheType } from '../types/types';

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

export function cacheItemToType(value: CacheItem): CacheType {
    if (typeof value === 'string') {
        return 'string';
    } else if (value instanceof ArrayBuffer) {
        return 'arrayBuffer';
    } else if (typeof value === 'object') {
        return 'json';
    } else {
        return 'string';
    }
}
