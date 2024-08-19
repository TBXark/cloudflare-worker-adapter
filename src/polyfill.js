// 判断是否支持 fetch
if (!globalThis.fetch) {
    import('node-fetch').then((fetch) => {
        globalThis.fetch = fetch.default;
        globalThis.Request = fetch.Request;
        globalThis.Response = fetch.Response;
        globalThis.Headers = fetch.Headers;
    });
}

// 判断是否支持 TextEncoder
if (!globalThis.TextEncoder) {
    import('node:util').then((util) => {
        globalThis.TextEncoder = util.TextEncoder;
    });
}
