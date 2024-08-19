// eslint-disable-next-line antfu/no-import-dist
import { startServer } from '../dist/cloudflare-worker-adapter.js';

startServer(3000, 'localhost', './wrangler.toml', {}, {
    server: 'https://tbxark.com',
}, async () => {
    return await fetch('https://api.github.com/users/tbxark');
});
