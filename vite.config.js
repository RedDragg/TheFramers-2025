import { defineConfig } from "vite";
import path from "node:path";
const __dirname = import.meta.dirname;

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    minify: false,
    emptyOutDir: false,
    outDir: "dist",
    rollupOptions: {
      input: path.resolve(__dirname, "client/index.js"),
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
      },
    },
  },
});
