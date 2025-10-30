import path from 'path';
import { fileURLToPath } from 'url';
import { sveltekit } from '@sveltejs/kit/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import dynamicImport from 'vite-plugin-dynamic-import';
import type { UserConfig, Plugin, ResolvedConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Plugin to force exit after build completes (fixes Docker hanging issue)
function closeBundle(): Plugin {
    let vite_config: ResolvedConfig;
    return {
        name: 'ClosePlugin',
        configResolved(config) {
            vite_config = config;
        },
        closeBundle: {
            sequential: true,
            async handler() {
                if (!vite_config.build.ssr) return;
                console.log('Build completed, exiting...');
                process.exit(0);
            }
        }
    };
}

const config: UserConfig = {
    server: {
        port: parseInt(process.env.PORT || '5000'),
        host: process.env.HOST || '0.0.0.0',
    },
    plugins: [
        sveltekit(),
        tsconfigPaths(),
        dynamicImport(),
        closeBundle()
    ],
    optimizeDeps: {
        include: ['dayjs', 'dayjs/plugin/relativeTime'], 
    }
};

export default config;