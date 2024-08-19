// eslint-disable-next-line antfu/no-import-dist
import { startServer, SQLiteCache } from '../dist/index.js';

const cache = new SQLiteCache('./cache.sqlite');

let counter = 0;

startServer(3000, 'localhost', './wrangler.toml', {}, {
    server: 'https://tbxark.com',
}, async () => {
    await cache.get('counter').then((value) => {
        console.log(JSON.stringify(value));
    }).catch((e) => {
        console.error(e);
    });
    counter++;
    await cache.put('counter', {counter});
    return await fetch('https://api.github.com/users/tbxark');
});
