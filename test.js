import adapter from './index.js';

adapter.startServer(3000, 'localhost', './wrangler.toml', {}, {
  server: 'https://tbxark.com',
}, async () => {
  return await fetch('https://api.github.com/users/tbxark');
});

