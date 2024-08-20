import type { URL } from 'node:url';
import { HttpsProxyAgent } from 'https-proxy-agent';
import type { RequestInfo, RequestInit } from 'node-fetch';
import fetch from 'node-fetch';

export function installFetchProxy(proxy: string) {
    if (proxy) {
        const agent = new HttpsProxyAgent(proxy);
        (globalThis as any).fetch = async (url: URL | RequestInfo, init: RequestInit) => {
            return fetch(url, { agent, ...(init as any) });
        };
    }
}
