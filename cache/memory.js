
export class MemoryCache {
  constructor() {
    this.cache = {};
  }
  async get(key, info) {
    const raw = this.cache[key];
    switch (info.type) {
      case 'string':
        return raw;
      case 'json':
        return JSON.parse(raw);
      case 'arrayBuffer':
        return raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength);
    default:
        return raw;
    }
  }

  async put(key, value, info) {
    if (value instanceof ArrayBuffer) {
      value = new Uint8Array(value);
    }
    this.cache[key] = typeof value === 'string' ? value : JSON.stringify(value);
    if (info && info.expiration) {
      setTimeout(() => {
        delete this.cache[key];
      }, info.expiration - Date.now());
    } else if (info && info.expirationTtl) {
      setTimeout(() => {
        delete this.cache[key];
      }, info.expirationTtl * 1000);
    }
  }

  async delete(key) {
    delete this.cache[key];
  }
}
