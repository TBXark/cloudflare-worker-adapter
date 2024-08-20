import { SQLiteCache, startServer } from '../src';

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
    return await fetch('https://api.github.com/users/tbxark');
});
