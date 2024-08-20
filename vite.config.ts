import * as path from 'node:path';
import { defineConfig } from 'vite';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { nodeExternals } from 'rollup-plugin-node-externals';
import dts from 'vite-plugin-dts';

export default defineConfig({
    plugins: [
        nodeResolve({
            preferBuiltins: true,
        }),
        dts({
            rollupTypes: true,
        }),
        nodeExternals(),
    ],
    build: {
        lib: {
            entry: {
                index: path.resolve(__dirname, 'src/index.ts'),
                serve: path.resolve(__dirname, 'src/serve/index.ts'),
                cache: path.resolve(__dirname, 'src/cache/index.ts'),
                localCache: path.resolve(__dirname, 'src/cache/local/index.ts'),
                memoryCache: path.resolve(__dirname, 'src/cache/memory/index.ts'),
                redisCache: path.resolve(__dirname, 'src/cache/redis/index.ts'),
                sqliteCache: path.resolve(__dirname, 'src/cache/sqlite/index.ts'),
                cacheUtils: path.resolve(__dirname, 'src/cache/utils/cache.ts'),
                fetchProxy: path.resolve(__dirname, 'src/proxy/index.ts'),
            },
            formats: ['es', 'cjs'],
        },
        minify: false,
    },
});
