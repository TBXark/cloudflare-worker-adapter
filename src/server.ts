import * as fs from 'node:fs';
import * as http from 'node:http';
import { Buffer } from 'node:buffer';
import { Readable } from 'node:stream';
import { parse } from 'toml';
import { MemoryCache } from './cache/memory.ts';

export interface ServerHandler {
    (req: Request, env: object): Promise<Response>;
}

export interface RequestBuilder {
    (baseURL: string, req: http.IncomingMessage): Promise<Request>;
}

export interface Setting {
    server?: string;
}

export function bindGlobal(target: Record<string, any>) {
    for (const key in target) {
        if (typeof target[key] === 'function') {
            (globalThis as any)[key] = target[key].bind(target);
        } else {
            (globalThis as any)[key] = target[key];
        }
    }
}

export function initEnv(config: string, options?: Record<string, any>) {
    let env: object = {};
    if (options) {
        env = {
            ...env,
            ...options,
        };
    }
    if (config) {
        const raw = fs.readFileSync(config, 'utf-8');
        const tomlFile = parse(raw);
        console.log(JSON.stringify(tomlFile.vars, null, 2));
        for (const key in (tomlFile.kv_namespaces || [])) {
            if (!(env as any)[key]) {
                console.log(`Database ${key} is not defined. Use MemoryCache.`);
                (env as any)[key] = new MemoryCache();
            }
        }
        env = {
            ...env,
            ...tomlFile.vars,
        };
    }
    return env;
}

export async function defaultRequestBuilder(baseURL: string, req: http.IncomingMessage): Promise<Request> {
    const url = new URL(req.url || '', baseURL);
    const init: RequestInit = {
        method: req.method || 'GET',
        headers: {},
        body: null,
    };
    for (const [key, value] of Object.entries(req.headers)) {
        (init.headers as any)[key] = value;
    }
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.readable) {
        const chunks = await Readable.from(req).toArray();
        init.body = Buffer.concat(chunks);
    }
    return new Request(url.toString(), init);
}

export function startServer(port: number = 3000, host: string = 'localhost', config: string, options: Record<string, any>, setting: object, handler: ServerHandler) {
    const env = initEnv(config, options);
    startServerV2(port, host, env, setting, defaultRequestBuilder, handler);
}

export function startServerV2(port: number = 3000, host: string = 'localhost', env: object, setting: Setting, requestBuilder: RequestBuilder, handler: ServerHandler) {
    const baseURL = setting?.server || `http://${host}`;
    const server = http.createServer(async (req, res) => {
        console.log(`\x1B[31m${req.method}\x1B[0m: ${req.url}`);
        const fetchReq = await (requestBuilder || defaultRequestBuilder)(baseURL, req);
        try {
            const fetchRes = await handler(fetchReq, env);
            res.statusCode = fetchRes.status;
            res.statusMessage = fetchRes.statusText;
            const ignoreHeaders = new Set(['content-encoding', 'content-length', 'transfer-encoding']);
            fetchRes.headers.forEach((value, key) => {
                if (!ignoreHeaders.has(key.toLowerCase())) {
                    res.setHeader(key, value);
                }
            });
            res.setHeader('Transfer-Encoding', 'chunked');
            if (fetchRes.body) {
                const readable = Readable.from(fetchRes.body);
                readable.pipe(res);
            } else {
                res.end();
            }
        } catch (error) {
            console.error(error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Internal Server Error');
        }
    });
    server.timeout = 30000;
    server.listen(port, host, () => {
        console.log(`Server listening on  http://${host}:${port || 3000}`);
    });
}
