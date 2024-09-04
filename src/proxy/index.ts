import { ProxyAgent, setGlobalDispatcher } from 'undici';

export function installFetchProxy(proxy: string) {
    if (proxy) {
        setGlobalDispatcher(new ProxyAgent(proxy));
    }
}
