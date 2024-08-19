import { defineConfig } from 'rollup';
import { terser } from 'rollup-plugin-terser';
import babel from '@rollup/plugin-babel';

export default defineConfig([
  {
    input: 'src/index.js',
    output: [
      {
        file: 'dist/index.js',
        format: 'es',
        sourcemap: true
      },
      {
        file: 'dist/index.cjs',
        format: 'cjs',
        sourcemap: true
      }
    ],
    plugins: [
      babel({
        babelHelpers: 'bundled',
        presets: ['@babel/preset-env']
      }),
      terser()
    ],
    external: [] // 如果有外部依赖，在这里列出
  }
]);