import adapter from './index.js';

adapter.startServer(3000, 'localhost', './wrangler.toml', {}, {
  server: 'https://tbxark.com',
}, async (request, env) => {
  // const resp = await fetch('https://api.github.com/users/tbxark');
  // const body = await resp.text();
  // console.log(body);
  // return new Response(body, {
  //     status: resp.status,
  //     statusText: resp.statusText,
  //     headers: resp.headers
  // })
  return await fetch('https://api.github.com/users/tbxark');
});

