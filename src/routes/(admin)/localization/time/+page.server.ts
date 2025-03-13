import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { localizationService } from '$lib/db';
import { TimeSettingsSchema } from '$lib/db/schemas';
import { sseService } from '$lib/server/sse/service';

export const load: PageServerLoad = async () => {
    try {
        const localization = await localizationService.getLocalization();
        const form = await superValidate(localization.timeSettings, zod(TimeSettingsSchema));
        
        return {
            title: 'Time Settings',
            form,
            currentLanguageCode: localization.language?.language_code || 'en'
        };
    } catch (error) {
        const form = await superValidate(zod(TimeSettingsSchema));
        return {
            form,
            error: "Failed to load time settings"
        };
    }
};

export const actions: Actions = {
    default: async ({ request }) => {
        const formData = await request.formData();
        try {
            const form = await superValidate(formData, zod(TimeSettingsSchema));
            if (!form.valid) {
                return fail (400, { form });
            }
            await localizationService.updateTimeSettings(form.data);

            // SSE update
            sseService.updateContent('Time settings updated');
            
            return { form };
        } catch (error) {
            const form = await superValidate(formData, zod(TimeSettingsSchema));
            return fail(500, { 
                form, 
                error: 'Failed to update time format settings'
            });        
        }
    }
};