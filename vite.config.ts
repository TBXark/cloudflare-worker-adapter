import { defineConfig } from 'vite';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import dts from 'vite-plugin-dts';

export default defineConfig({
    plugins: [
        nodeResolve({
            preferBuiltins: true,
        }),
        dts({
            rollupTypes: true,
        }),
    ],
    build: {
        lib: {
            entry: './src/index.ts',
            fileName: 'index',
            formats: ['es', 'cjs'],
        },
        rollupOptions: {
            external: ['ioredis', 'node-fetch', 'promised-sqlite3', 'toml', 'node:fs', 'node:http', 'node:util', 'node:stream', 'node:buffer', 'node:fs/promises'],
        },
        minify: false,
    },
});
