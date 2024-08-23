import { Buffer } from 'node:buffer';
import { ReadableStream } from 'node:stream/web';
import { buffer } from 'node:stream/consumers';
import type { CacheItem, CacheType, PutCacheInfo } from '../types';

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

export function calculateExpiration(info?: PutCacheInfo): number | null {
    if (info?.expiration) {
        return info.expiration;
    }
    if (info?.expirationTtl) {
        return Date.now() + info.expirationTtl;
    }
    return null;
}
