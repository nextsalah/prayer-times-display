import type { PageServerLoad } from './$types';
export const load = (async () => {
    return {
        title: 'Config',
    };
}) satisfies PageServerLoad;