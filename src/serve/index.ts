import * as fs from 'node:fs';
import * as http from 'node:http';
import { Readable } from 'node:stream';
import { parse } from 'toml';

export interface ServerHandler {
    (req: Request, env: any): Promise<Response>;
}

export interface RequestBuilder {
    (baseURL: string, req: http.IncomingMessage): Request;
}

export type HTTPScheme = 'http' | 'https';

export interface ForwardSetting {
    schema?: HTTPScheme;
    host?: string;
    baseURL?: string;
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

export function initEnv(config: string, options?: Record<string, any>): Record<string, any> {
    let env: Record<string, any> = {};
    if (options) {
        env = {
            ...env,
            ...options,
        };
    }
    if (config) {
        const raw = fs.readFileSync(config, 'utf-8');
        const tomlFile = parse(raw);
        for (const key of (tomlFile.kv_namespaces || [])) {
            if (!Object.prototype.hasOwnProperty.call(env, key.binding)) {
                throw new Error(`Missing kv_namespaces: ${key.binding}`);
            }
        }
        env = {
            ...env,
            ...tomlFile.vars,
        };
    }
    return env;
}

export function defaultRequestBuilder(baseURL: string, req: http.IncomingMessage): Request {
    const url = new URL(req.url || '', baseURL);
    const headers: Record<string, string | string[]> = {};
    for (const [key, value] of Object.entries(req.headers)) {
        headers[key] = value;
    }
    const init: RequestInit = {
        method: req.method || 'GET',
        headers: headers as any,
        body: null,
    };
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.readable) {
        init.body = Readable.from(req) as any;
        (init as any).duplex = 'half';
    }
    return new Request(url.toString(), init);
}

export function startServer(port: number = 3000, hostname: string = 'localhost', config: string, options: Record<string, any>, setting: ForwardSetting, handler: ServerHandler) {
    const env = initEnv(config, options);
    startServerV2(port, hostname, env, setting, defaultRequestBuilder, handler);
}

export function startServerV2(port: number = 3000, hostname: string = 'localhost', env: any, setting: ForwardSetting, requestBuilder: RequestBuilder = defaultRequestBuilder, handler: ServerHandler) {
    const server = http.createServer(async (req, res) => {
        console.log(`\x1B[31m${req.method}\x1B[0m: ${req.url}`);
        const baseURL = setting.baseURL || `${setting.schema || 'http'}://${setting.host || req.headers.host || `${hostname}:${port}`}`;
        try {
            const fetchReq = (requestBuilder || defaultRequestBuilder)(baseURL, req);
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
                readable.on('error', () => {
                    res.destroy();
                });
                res.on('close', () => {
                    readable.destroy();
                });
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
    server.listen(port, hostname, () => {
        console.log(`Server listening on  ${hostname}:${port || 3000}`);
    });
}
