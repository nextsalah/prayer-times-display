import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load = (async () => {
    return {};
}) satisfies PageServerLoad;