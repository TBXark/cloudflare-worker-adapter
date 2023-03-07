import {Command, Option} from 'commander';
import http from 'http';
import fetch, {Request, Response, Headers} from 'node-fetch';
import EventEmitter from 'events';
import {TextEncoder} from 'util';


const globalEventEmitter = new EventEmitter();

global.fetch = fetch;
global.Request = Request;
global.Response = Response;
global.Headers = Headers;
global.TextEncoder = TextEncoder;
global.addEventListener =
  globalEventEmitter.addListener.bind(globalEventEmitter);

function convertIncomeToNodeFecthRequest(income, host) {
  const {url, method, headers} = income;
  const body =  method === 'POST' ? income : undefined;
  return new Request(`${host}${url}`, {method, headers, body});
}

async function mergeNodeFecthResponseIntoOutcome(nodeFecthResponse, outcome) {
  const {status, headers} = nodeFecthResponse;
  outcome.writeHead(status, headers);
  const res = await nodeFecthResponse.text();
  outcome.end(res);
}

function isPromise(obj) {
  return (
    !!obj &&
    (typeof obj === 'object' || typeof obj === 'function') &&
    typeof obj.then === 'function'
  );
}

export function startServer(port, host) {

  const opts = new Command()
    .addOption(new Option('-h, --host <host>', 'Host to listen on', 'localhost').default('localhost')) // eslint-disable-line max-len
    .addOption(new Option('-p, --port <port>', 'Port to listen on', '3000').argParser(parseInt).default(3000)) // eslint-disable-line max-len
    .parse(process.argv)
    .opts()
  
  port = opts.port || port;
  host = opts.host || 'localhost';

  const server = http
      .createServer((req, res) => {
        const event = {
          request: convertIncomeToNodeFecthRequest(req, host),
          respondWith: (response) => {
            if (isPromise(response)) {
              response.then((data) => {
                mergeNodeFecthResponseIntoOutcome(data, res);
              });
            } else {
              mergeNodeFecthResponseIntoOutcome(response, res);
            }
          },
        };
        globalEventEmitter.emit('fetch', event);
      })
      .listen(port, host);

  console.log(`Server running at ${host}:${port}/`);
  return server;
}

export function bindGlobal(target) {
  Object.keys(target).forEach((key) => {
    if (typeof target[key] === 'function') {
      global[key] = target[key].bind(target);
    } else {
      global[key] = target[key];
    }
  });
}


export class MemoryCache {
  constructor() {
    this.cache = {};
  }
  async get(key) {
    return this.cache[key];
  }

  async put(key, value) {
    this.cache[key] = value;
  }

  async delete(key) {
    delete this.cache[key];
  }
}
