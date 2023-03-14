import fetch, {Request, Response, Headers} from 'node-fetch';
import {TextEncoder} from 'util';
import toml from 'toml';
import fs from 'fs';
import http from 'http';

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
    let env = {};
    if (config) {
      const raw = fs.readFileSync(config);
      const tomlFile = toml.parse(raw);
      env = {
        ...env,
        ...tomlFile,
      };
    }
    if (database) {
      env = {
        ...env,
        ...database,
      };
    }
    const server = http.createServer(async (req, res) => {
      console.log(`${req.method}: ${req.url}`);
      const url = setting.server + req.url;
      const method = req.method;
      const headers = req.headers;
      const body = req.method !== 'POST' ? req : undefined;
      const fetchReq = new Request(url, {method, headers, body});
      try {
        const fetchRes = await handler(fetchReq, env);
        console.log(fetchRes);
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
      console.log(`Server listening on port ${port || 3000}`);
    });
  },
};
