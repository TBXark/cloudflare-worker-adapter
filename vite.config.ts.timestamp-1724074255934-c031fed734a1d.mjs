// vite.config.ts
import { defineConfig } from "file:///Users/tbxark/Desktop/Repos/tbxark/cloudflare-worker-adapter/node_modules/vite/dist/node/index.js";
import { nodeResolve } from "file:///Users/tbxark/Desktop/Repos/tbxark/cloudflare-worker-adapter/node_modules/@rollup/plugin-node-resolve/dist/es/index.js";
import dts from "file:///Users/tbxark/Desktop/Repos/tbxark/cloudflare-worker-adapter/node_modules/vite-plugin-dts/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [
    nodeResolve({
      preferBuiltins: true
    }),
    dts({
      rollupTypes: true
    })
  ],
  build: {
    lib: {
      entry: "./src/index.ts",
      fileName: "index",
      formats: ["es", "cjs"]
    },
    rollupOptions: {
      external: ["ioredis", "node-fetch", "sqlite3", "toml", "node:fs", "node:http", "node:util", "node:stream", "node:buffer", "node:fs/promises"]
    },
    minify: false
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvdGJ4YXJrL0Rlc2t0b3AvUmVwb3MvdGJ4YXJrL2Nsb3VkZmxhcmUtd29ya2VyLWFkYXB0ZXJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy90YnhhcmsvRGVza3RvcC9SZXBvcy90YnhhcmsvY2xvdWRmbGFyZS13b3JrZXItYWRhcHRlci92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvdGJ4YXJrL0Rlc2t0b3AvUmVwb3MvdGJ4YXJrL2Nsb3VkZmxhcmUtd29ya2VyLWFkYXB0ZXIvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IG5vZGVSZXNvbHZlIH0gZnJvbSAnQHJvbGx1cC9wbHVnaW4tbm9kZS1yZXNvbHZlJztcbmltcG9ydCBkdHMgZnJvbSAndml0ZS1wbHVnaW4tZHRzJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgICBwbHVnaW5zOiBbXG4gICAgICAgIG5vZGVSZXNvbHZlKHtcbiAgICAgICAgICAgIHByZWZlckJ1aWx0aW5zOiB0cnVlLFxuICAgICAgICB9KSxcbiAgICAgICAgZHRzKHtcbiAgICAgICAgICAgIHJvbGx1cFR5cGVzOiB0cnVlLFxuICAgICAgICB9KSxcbiAgICBdLFxuICAgIGJ1aWxkOiB7XG4gICAgICAgIGxpYjoge1xuICAgICAgICAgICAgZW50cnk6ICcuL3NyYy9pbmRleC50cycsXG4gICAgICAgICAgICBmaWxlTmFtZTogJ2luZGV4JyxcbiAgICAgICAgICAgIGZvcm1hdHM6IFsnZXMnLCAnY2pzJ10sXG4gICAgICAgIH0sXG4gICAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgICAgIGV4dGVybmFsOiBbJ2lvcmVkaXMnLCAnbm9kZS1mZXRjaCcsICdzcWxpdGUzJywgJ3RvbWwnLCAnbm9kZTpmcycsICdub2RlOmh0dHAnLCAnbm9kZTp1dGlsJywgJ25vZGU6c3RyZWFtJywgJ25vZGU6YnVmZmVyJywgJ25vZGU6ZnMvcHJvbWlzZXMnXSxcbiAgICAgICAgfSxcbiAgICAgICAgbWluaWZ5OiBmYWxzZSxcbiAgICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXNXLFNBQVMsb0JBQW9CO0FBQ25ZLFNBQVMsbUJBQW1CO0FBQzVCLE9BQU8sU0FBUztBQUVoQixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUN4QixTQUFTO0FBQUEsSUFDTCxZQUFZO0FBQUEsTUFDUixnQkFBZ0I7QUFBQSxJQUNwQixDQUFDO0FBQUEsSUFDRCxJQUFJO0FBQUEsTUFDQSxhQUFhO0FBQUEsSUFDakIsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNILEtBQUs7QUFBQSxNQUNELE9BQU87QUFBQSxNQUNQLFVBQVU7QUFBQSxNQUNWLFNBQVMsQ0FBQyxNQUFNLEtBQUs7QUFBQSxJQUN6QjtBQUFBLElBQ0EsZUFBZTtBQUFBLE1BQ1gsVUFBVSxDQUFDLFdBQVcsY0FBYyxXQUFXLFFBQVEsV0FBVyxhQUFhLGFBQWEsZUFBZSxlQUFlLGtCQUFrQjtBQUFBLElBQ2hKO0FBQUEsSUFDQSxRQUFRO0FBQUEsRUFDWjtBQUNKLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
