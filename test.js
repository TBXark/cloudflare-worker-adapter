import adapter from './index.js'

adapter.startServer(3000, 'localhost', './wrangler.toml', {}, {
    host: 'https://tbxark.com'
}, async (request, env) => {
    return await fetch('https://api.github.com/users/tbxark');
})