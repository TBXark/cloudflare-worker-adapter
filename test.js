import {startServer} from './index.js';

// https://developers.cloudflare.com/workers/examples/return-json/

addEventListener('fetch', (event) => {
  const data = {
    hello: 'world',
  };

  const json = JSON.stringify(data, null, 2);

  return event.respondWith(
      new Response(json, {
        headers: {
          'content-type': 'application/json;charset=UTF-8',
        },
      }),
  );
});

startServer();
