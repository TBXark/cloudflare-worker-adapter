import type { CacheItem, CacheType, PutCacheInfo } from '../types';
import { Buffer } from 'node:buffer';
import { buffer } from 'node:stream/consumers';
import { ReadableStream } from 'node:stream/web';

export function decodeCacheItem(value: string, type?: CacheType): CacheItem {
    switch (type) {
        case 'string':
        case 'text':
            return value;
        case 'json':
            return JSON.parse(value);
        case 'arrayBuffer':
            return Buffer.from(value, 'base64');
        case 'stream':
            return new ReadableStream({
                start(controller) {
                    controller.enqueue(Buffer.from(value, 'base64'));
                    controller.close();
                },
            });
        default:
            return value;
    }
}

export async function encodeCacheItem(value: CacheItem): Promise<string> {
    if (typeof value === 'string') {
        return value;
    } else if (value instanceof ArrayBuffer) {
        return Buffer.from(value).toString('base64');
    } else if (value instanceof ReadableStream) {
        return Buffer.from(await buffer(value)).toString('base64');
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
    } else if (value instanceof ReadableStream) {
        return 'stream';
    } else if (typeof value === 'object') {
        return 'json';
    } else {
        return 'string';
    }
}

// expiration is the number that represents when to expire the key-value pair in seconds since epoch.
// expirationTtl is the number that represents when to expire the key-value pair in seconds from now. The minimum value is 60
export function calculateExpiration(info?: PutCacheInfo): number | null {
    // Timestamp in units of seconds
    if (info?.expiration) {
        return info.expiration;
    }
    // Time to live in units of seconds
    if (info?.expirationTtl) {
        return Math.floor(Date.now() / 1000) + info.expirationTtl;
    }
    return null;
}

export function isExpired(expiration: number | null): boolean {
    if (!expiration) {
        return false;
    }
    if (expiration < 0) {
        return false;
    }
    return expiration < Math.floor(Date.now() / 1000);
}
