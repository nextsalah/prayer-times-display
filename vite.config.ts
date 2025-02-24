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
        fs: {
            allow: ['..', '../themes']
        },
        port: 5000,
    },
    plugins: [
        sveltekit(),
        tsconfigPaths(),
        dynamicImport()
    ],
    resolve: {
        alias: {
            $themes: path.resolve(__dirname, 'themes'),
        },
    },
    optimizeDeps: {
        include: ['dayjs', 'dayjs/plugin/relativeTime'], // Since you're using these
    }
};

export default config;