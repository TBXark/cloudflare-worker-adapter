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
        target: 'esnext',
        lib: {
            entry: 'index.ts',
            fileName: 'index',
            formats: ['es', 'cjs'],
        },
        minify: false,
    },
});
