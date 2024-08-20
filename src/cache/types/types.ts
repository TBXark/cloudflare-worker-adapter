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
