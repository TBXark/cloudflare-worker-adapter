# Cloudflare worker adapter

Run your script without cloudflare workers.


### Usage

```shell
yarn add https://github.com/TBXark/cloudflare-worker-adapter.git
```

### Example

##### Demo
```js
import { bindGlobal, startServer, MemoryCache  } from 'cloudflare-worker-adapter';

bindGlobal({ 
  YourCache1: new MemoryCache(),
  YourEnvVar1: "123"
});

addEventListener('fetch', (event) => {
    // Your cloudflare worker code goes here
});

startServer();
```

##### proxy-render example
https://github.com/TBXark/proxy-render/tree/master/example/server
