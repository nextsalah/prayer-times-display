import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    // This is just a hub page, so we don't need to load any data
    return {};
};