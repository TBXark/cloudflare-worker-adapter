import * as process from 'node:process';
import { ProxyAgent, setGlobalDispatcher } from 'undici';

export function installFetchProxy(proxy: string) {
    if (proxy) {
        setGlobalDispatcher(new ProxyAgent(proxy));
    }
}

export function systemProxy(): string | null {
    if (process.env.http_proxy) {
        return process.env.http_proxy;
    }
    if (process.env.HTTP_PROXY) {
        return process.env.HTTP_PROXY;
    }
    if (process.env.https_proxy) {
        return process.env.https_proxy;
    }
    if (process.env.HTTPS_PROXY) {
        return process.env.HTTPS_PROXY;
    }
    if (process.env.all_proxy) {
        return process.env.all_proxy;
    }
    if (process.env.ALL_PROXY) {
        return process.env.ALL_PROXY;
    }
    return null;
}
