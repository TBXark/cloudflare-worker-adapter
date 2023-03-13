export default {
    async fetch(request, env) {
        const DATABASE = env.DATABASE;
        const TOKEN = env.TOKEN;
        const key = new URL(request.url).searchParams.get('key');

        if (request.headers.get('Authorization') !== `Bearer ${TOKEN}`) {
            return new Response('Unauthorized', {status: 401});
        }

        switch (request.method) {
            case 'GET':
                return new Response(await DATABASE.get(key, {type: 'string'}));
            case 'PUT':
                const {value, info} = await request.json();
                await DATABASE.put(key, value, info);
                return new Response('OK');
            case 'DELETE':
                await DATABASE.delete(key);
                return new Response('OK');
            default:
                return new Response('Method not allowed', {status: 405});
        }
    },
  };