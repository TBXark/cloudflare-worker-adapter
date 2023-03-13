import adapter from './index.js'

adapter.startServer(3000, 'localhost', './wrangler.toml', {}, async (request, env) => {
    return new Response('Hello world', {
        status: 200,
    })
})