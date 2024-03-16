import type { PageLoad } from './$types';

export const load = (async () => {
    return  {
        "title" : "Settings",
    }
}) satisfies PageLoad;