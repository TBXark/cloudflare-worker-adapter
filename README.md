# cloudflare-worker-adapter

由于国内糟糕的网络环境, 导致使用`wrangler dev`调试基本不太可能。使用cloudflare workers网页面板调试也比较复杂。所以这里提供一个简单的适配器，可以在本地调试。

可以使用vscode断点调试，加上`--watch`可以实现热更新。

<img width="600" alt="image" src="https://user-images.githubusercontent.com/9513891/224906690-d9692649-ab5a-4c5a-98e2-49dc122d611a.png">


### Usage

```shell
npm i cloudflare-worker-adapter
```

### Example

https://github.com/TBXark/ChatGPT-Telegram-Workers

```js
import fs from 'node:fs';
import { bindGlobal, createCache, startServer } from 'cloudflare-worker-adapter';
import { HttpsProxyAgent } from 'https-proxy-agent';
import fetch from 'node-fetch';
import worker from '../../main.js';
import { ENV } from '../../src/config/env.js';

const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
const cache = await createCache(config?.database?.type, config?.database);
console.log(`database: ${config?.database?.type} is ready`);

const proxy = config?.https_proxy || process.env.https_proxy || process.env.HTTPS_PROXY;
if (proxy) {
    console.log(`https proxy: ${proxy}`);
    const agent = new HttpsProxyAgent(proxy);
    const proxyFetch = async (url, init) => {
        return fetch(url, { agent, ...init });
    };
    bindGlobal({
        fetch: proxyFetch,
    });
}

try {
    const buildInfo = JSON.parse(fs.readFileSync('../../dist/buildinfo.json', 'utf-8'));
    ENV.BUILD_TIMESTAMP = buildInfo.timestamp;
    ENV.BUILD_VERSION = buildInfo.sha;
    console.log(buildInfo);
} catch (e) {
    console.log(e);
}

startServer(
    config.port || 8787,
    config.host || '0.0.0.0',
    '../../wrangler.toml',
    { DATABASE: cache },
    { server: config.server },
    worker.fetch,
);

```

### Best Practice

如果你有在公网被调用的需求，使用内网穿透工具，将本地调试的端口映射到外网，这样就可以正常的交互了。

这里只对KV进行了基本的实现，如果你的项目中遇到的没有实现的类或者方法。可以自行实现之后使用`bindGlobal`进行绑定。同时欢迎把你的实现提交到这个项目中。
