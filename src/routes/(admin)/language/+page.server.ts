import type { PageServerLoad } from './$types';
import { LanguageService } from '$lib/db'
export const load = (async () => {
    const language = await LanguageService.get();
    console.log(language.fajr);

    return {

    };
}) satisfies PageServerLoad;