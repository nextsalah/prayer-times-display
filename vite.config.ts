import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";
import dynamicImport from "vite-plugin-dynamic-import";
export default defineConfig({
  plugins: [sveltekit(), dynamicImport()],
  server: {
    port: 3000,
  },
});
