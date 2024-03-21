import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import dynamicImport from 'vite-plugin-dynamic-import'
export default defineConfig({
	plugins: [sveltekit(),dynamicImport()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	server: {
		port:3000
	} 
});
