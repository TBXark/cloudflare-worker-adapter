import {Command, Option} from 'commander';
import http from 'http';
import fetch, {Request, Response} from 'node-fetch';
import EventEmitter from 'events';

const globalEventEmitter = new EventEmitter();

global.fetch = fetch;
global.Request = Request;
global.Response = Response;
global.addEventListener =
  globalEventEmitter.addListener.bind(globalEventEmitter);

function convertIncomeToNodeFecthRequest(income, host) {
  const {url, method, headers, body} = income;
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

export function startServer(port) {
  const host = `http://localhost`;

  if (port === undefined || port === null) {
    port = new Command()
        .addOption(new Option('-p, --port <port>', 'Port to listen on', '3000').argParser(parseInt).default(3000)) // eslint-disable-line max-len
        .parse(process.argv)
        .opts()
        .port;
  }

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
      .listen(port);

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
