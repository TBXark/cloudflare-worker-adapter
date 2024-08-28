import * as process from 'node:process';
import { SQLiteCache, installFetchProxy, startServer } from '../src';

const proxy = process.env.HTTP_PROXY || process.env.HTTPS_PROXY || '';
if (proxy) {
    installFetchProxy(proxy);
}

const cache = new SQLiteCache('./test/.temp/cache.sqlite');
(async () => {
    await cache.put('test', { data: 'test' });
    console.log(await cache.get('test'));
    console.log(await cache.list());
    await cache.delete('test');
    console.log(await cache.get('test'));
    console.log(await cache.list());
})();

interface Config {
    port: number;
    hostname: string;
    options: Record<string, any>;
    config: string;
    setting: {
        baseURL?: string;
    };
}

const config: Config = {
    port: 8787, // Port to listen on
    hostname: '0.0.0.0', // Hostname to listen on
    options: {
        DATABASE: cache, // Cloudflare Workers bindings
    },
    config: './test/wrangler.toml', // Path to wrangler.toml
    setting: {
        baseURL: 'https://example.com', // Base URL for the worker fetch
    },
};

// Replace the following code with your own code
async function workerFetch(req: Request) {
    console.log('Request:', req.url);
    return await fetch('https://api.github.com/users/tbxark');
}

startServer(config.port, config.hostname, config.config, config.options, config.setting, workerFetch);
