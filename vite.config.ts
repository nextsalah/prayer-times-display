import path from 'path';
import { fileURLToPath } from 'url';
import { sveltekit } from '@sveltejs/kit/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import dynamicImport from 'vite-plugin-dynamic-import';
import type { UserConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config: UserConfig = {
    server: {
        port: parseInt(process.env.PORT || '5000'),
        host: process.env.HOST || '0.0.0.0',
    },
    plugins: [
        sveltekit(),
        tsconfigPaths(),
        dynamicImport()
    ],
    optimizeDeps: {
        include: ['dayjs', 'dayjs/plugin/relativeTime'], 
    }
};

export default config;