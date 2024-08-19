import { SQLiteCache, startServer } from '../src/index';

const cache = new SQLiteCache('.temp/cache.sqlite');

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
    await cache.put('counter', { counter });
    return await fetch('https://api.github.com/users/tbxark');
});
