# Cloudflare worker adapter

Run your script without cloudflare workers.


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