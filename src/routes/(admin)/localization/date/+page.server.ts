import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { localizationService } from '$lib/db';
import { DateSettingsSchema } from '$lib/db/schemas';
import { sseService } from '$lib/server/sse/service';

export const load: PageServerLoad = async () => {
    try {
        const localization = await localizationService.getLocalization();
        const form = await superValidate(localization.dateSettings, zod(DateSettingsSchema));
        return {
            title: 'Date Settings',
            form,
            currentLanguageCode: localization.language?.language_code || 'en'
        };
    } catch (error) {
        const form = await superValidate(zod(DateSettingsSchema));
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
            const form = await superValidate(formData, zod(DateSettingsSchema));
            if (!form.valid) {
                return fail (400, { form });
            }
            
            // Update the database
            await localizationService.updateDateSettings(form.data);
            
            // Small delay to prevent accidental double submissions
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Trigger content update notification
            sseService.updateContent('Date settings updated');
            
            return { form };
        } catch (error) {
            const form = await superValidate(formData, zod(DateSettingsSchema));
            return fail(500, { 
                form, 
                error: 'Failed to update date format settings'
            });        
        }
    }
};