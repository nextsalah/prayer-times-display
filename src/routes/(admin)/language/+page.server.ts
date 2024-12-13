import type { PageServerLoad } from './$types';
import { LanguageService } from '$lib/db'
import { LanguageSchema } from '$lib/db/schemas';
import { zod } from 'sveltekit-superforms/adapters';
import { superValidate } from 'sveltekit-superforms';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = (async () => {
    const language = await LanguageService.get();
    const form = await superValidate(language, zod(LanguageSchema));
    return {
        title: "Language",
        form : form
    };
});


export const actions = {
    default: async ({ request }) => {
        const form = await superValidate(request, zod(LanguageSchema));
        if (!form.valid) {
            console.error('Invalid form data:', form);
            return fail(400, { form });
        }

        try {
            const updatedLanguage = await LanguageService.update(form.data);
            // Create new form with updated data
            const newForm = await superValidate(updatedLanguage, zod(LanguageSchema));
            return { form: newForm };
        } catch (e) {
            console.error('Failed to update language settings:', e);
            return fail(500, { 
                form,
                error: 'Failed to update settings. Please try again.'
            });
        }
    }
};