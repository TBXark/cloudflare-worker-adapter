import * as path from 'node:path';
import { defineConfig } from 'vite';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { nodeExternals } from 'rollup-plugin-node-externals';
import typescript from '@rollup/plugin-typescript';

export default defineConfig({
    plugins: [
        nodeResolve({
            preferBuiltins: true,
        }),
        typescript({
            declaration: true,
            declarationDir: './dist',
            rootDir: './src',
        }),
        nodeExternals(),
    ],
    build: {
        lib: {
            entry: {
                index: path.resolve(__dirname, 'src/index.ts'),
            },
            formats: ['es', 'cjs'],
        },
        rollupOptions: {
            output: {
                preserveModules: true,
                dir: 'dist',
            },
        },
        minify: false,
    },
});
