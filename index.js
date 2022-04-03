import {Command} from 'commander';
import http from 'http';
import fetch, {Request, Response} from 'node-fetch';

global.fetch = fetch;
global.Request = Request;
global.Response = Response;
global.addEventListener = addEventListener;


export function bindGlobal(target) {
  Object.keys(target).forEach((key) => {
    if (typeof target[key] === 'function') {
      global[key] = target[key].bind(target);
    } else {
      global[key] = target[key];
    }
  });
}


const eventListenersStore = {};

function addEventListener(type, listener) {
  if (typeof listener !== 'function') {
    throw new Error('listener must be a function');
  }
  if (!eventListenersStore[type]) {
    eventListenersStore[type] = [];
  }
  eventListenersStore[type].push(listener);
}

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

function stringToNumber(str, defaultValue) {
  const num = parseInt(str, 10);
  if (isNaN(num)) {
    return defaultValue;
  }
  return num;
}

export function startServer(port) {
  const host = `http://localhost`;

  if (port === undefined || port === null) {
    const program = new Command();
    program
        .option('-p, --port <number>', 'Port to listen on', '3000')
        .parse(process.argv);
    const options = program.opts();
    port = stringToNumber(options.port, 3000);
  }

  function isPromise(obj) {
    return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
  }

  const server = http.createServer((req, res) => {
      const listeners = eventListenersStore['fetch'];
        if (listeners) {
            const event = {
                request: convertIncomeToNodeFecthRequest(req, host),
                respondWith: (response) => {
                    if (isPromise(response)) {
                        response.then((nodeFecthResponse) => {
                            mergeNodeFecthResponseIntoOutcome(nodeFecthResponse, res);
                        });
                    } else {
                        mergeNodeFecthResponseIntoOutcome(response, res);
                    }
                }
            };
            for (const listener of listeners) {
                listener(event);
            }
        }
  }).listen(port);

  console.log(`Server running at ${host}:${port}/`);
  return server;
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
  