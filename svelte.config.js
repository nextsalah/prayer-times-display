import adapter from "svelte-adapter-bun";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [
    vitePreprocess(),
  ],
  kit: {
    adapter: adapter({
      // Use environment variables for host and port
      development: false,
      precompress: {
        brotli: true,
        gzip: true,
        files: ['html', 'js', 'json', 'css', 'svg', 'xml']
      }
    }),
    csrf: false
  },
};

export default config;
