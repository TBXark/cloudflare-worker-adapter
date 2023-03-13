import fetch from 'node-fetch';

export class RemoteCache {
  constructor(url, db, token) {
    this.url = url;
    this.db = db;
    this.token = token;
  }

  async get(key, info) {
    const resp = await fetch(this.url + `?db=${db}&key=${key}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
    const raw = await resp.text();
    switch (info.type) {
      case 'string':
        return raw;
      case 'json':
        return JSON.parse(raw);
      case 'arrayBuffer':
        return new Uint8Array(raw).buffer;
      default:
        return raw;
    }
  }

  async put(key, value, info) {
    await fetch(this.url + `?db=${db}&key=${key}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({
        value: typeof value === 'string' ? value : JSON.stringify(value),
        info,
      }),
    });
  }

  async delete(key) {
    await fetch(this.url + `?db=${db}&key=${key}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
  }
}


