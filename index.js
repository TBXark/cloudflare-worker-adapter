import fetch, {Request, Response, Headers} from 'node-fetch';
import {TextEncoder} from 'util';
import toml from 'toml';
import fs from 'fs';
import http from 'http';
import {MemoryCache} from './cache/memory.js';

global.fetch = fetch;
global.Request = Request;
global.Response = Response;
global.Headers = Headers;
global.TextEncoder = TextEncoder;

export function bindGlobal(target) {
  Object.keys(target).forEach((key) => {
    if (typeof target[key] === 'function') {
      global[key] = target[key].bind(target);
    } else {
      global[key] = target[key];
    }
  });
}

function inirEnv(config, database) {
  let env = {};
  if (database) {
    env = {
      ...env,
      ...database,
    };
  }
  if (config) {
    const raw = fs.readFileSync(config);
    const tomlFile = toml.parse(raw);
    console.log(JSON.stringify(tomlFile.vars, null, 2));
    env = {
      ...env,
      ...tomlFile.vars,
    };
    for (const key in (env.kv_namespaces || [])) {
      if (!env[key]) {
        console.log(`Database ${key} is not defined. Use MemoryCache.`);
        env[key] = new MemoryCache();
      }
    }
  }
  return env;
}

const bodyMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
/**
 * 
 * @param {string} baseURL 
 * @param {Request} req 
 * @return {Request}
 */
export function defaultRequestBuilder(baseURL, req) {
  const url = baseURL + req.url;
  const method = req.method;
  const headers = req.headers;
  const body = bodyMethods.has(method) ? req : null;
  return new Request(url, {method, headers, body});
}

export default {

  
  /**
 * Create a server for local development
 *
 * @param {number} port - 3000
 * @param {string} host - 'localhost'
 * @param {string} config - path to wrangler.toml
 * @param {object} database - { DB: new MemoryCache() }
 * @param {object} setting - { server: 'https://example.com' }
 * @param {function} handler
 */
  startServer(port, host, config, database, setting, handler) {
    port = port || 3000;
    host = host || 'localhost';
    const env = inirEnv(config, database);
    this.startServerV2(port, host, env, setting, defaultRequestBuilder, handler);
  },

  /**
   * 
   * @param {number} port 
   * @param {string} host 
   * @param {object} env 
   * @param {object} setting 
   * @param {function} handler
   * @param {function} handler 
   */
  startServerV2(port, host, env, setting, requestBuilder, handler) {
    const baseURL = setting?.server || `http://${host}`;
    const server = http.createServer(async (req, res) => {
      console.log(`\x1b[31m${req.method}\x1b[0m: ${req.url}`);
      const fetchReq = (requestBuilder || defaultRequestBuilder)(baseURL, req);
      try {
        const fetchRes = await handler(fetchReq, env);
        res.statusCode = fetchRes.status;
        res.statusMessage = fetchRes.statusText;
        res.headers = fetchRes.headers;
        const body = await fetchRes.text();
        res.end(body);
      } catch (error) {
        console.error(error);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    });
    server.timeout = 30000;
    server.listen(port || 3000, host || 'localhost', () => {
      console.log(`Server listening on  http://${host}:${port || 3000}`);
    });
  },
};
