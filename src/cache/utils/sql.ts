export function createSQLCacheStmt(table: string): SQLCacheStmt {
    const create = `CREATE TABLE IF NOT EXISTS ${table} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key VARCHAR(100) NOT NULL UNIQUE,
            value TEXT,
            type VARCHAR(10),
            expiration INTEGER
        )`;
    const get = `SELECT * FROM ${table} WHERE key = ?`;
    const upt = `INSERT INTO ${table} (key, value, type, expiration) VALUES (?, ?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = ?, type = ?, expiration = ?`;
    const del = `DELETE FROM ${table} WHERE key = ?`;
    const list = `SELECT key FROM ${table} WHERE key LIKE ? LIMIT ?`;
    const listNoLimit = `SELECT key FROM ${table} WHERE key LIKE ?`;
    return { create, get, upsert: upt, delete: del, list, listNoLimit };
}

export interface SQLCacheStmt {
    create: string;
    get: string;
    upsert: string;
    delete: string;
    list: string;
    listNoLimit: string;
}

export interface SQLCacheRow {
    id?: number;
    key: string;
    value: string;
    type: string;
    expiration: number;
}
