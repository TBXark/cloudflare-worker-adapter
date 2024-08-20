import * as process from 'node:process';
import { SQLiteCache, startServer } from '../src';
import { installFetchProxy } from '../src/proxy';

const proxy = process.env.HTTP_PROXY || process.env.HTTPS_PROXY || '';
if (proxy) {
    installFetchProxy(proxy);
}

const cache = new SQLiteCache('./test/.temp/cache.sqlite');

let counter = 0;

startServer(8787, '0.0.0.0', './test/wrangler.toml', {
    DATABASE: cache,
}, {
    schema: 'https',
    // baseURL: 'https://tbxark.com',
}, async (req) => {
    console.log('Request:', req.url);
    await cache.get('counter').then((value) => {
        console.log(JSON.stringify(value));
    }).catch((e) => {
        console.error(e);
    });
    counter++;
    await cache.put('counter', { counter });
    console.log(await cache.list('c'));
    return await fetch('https://api.github.com/users/tbxark');
});
