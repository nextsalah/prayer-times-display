import type { PageServerLoad, Actions } from './$types';
import { localizationService } from '$lib/db';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { LanguageSchema } from '$lib/db/schemas';

export const load: PageServerLoad = async () => {
    try {
        // Get current localization settings
        const localization = await localizationService.getLocalization();
        
        // Create form with current language settings
        const form = await superValidate(localization.language, zod(LanguageSchema));
        
        return {
            form,
            currentLanguageCode: localization.language?.language_code || 'en'
        };
    } catch (error) {
        console.error("Error loading language settings:", error);
        // Create empty form as fallback
        const form = await superValidate(zod(LanguageSchema));
        return {
            form,
            currentLanguageCode: 'en',
            error: "Failed to load language settings"
        };
    }
};

export const actions: Actions = {
    default: async ({ request }) => {
        const formData = await request.formData();
        
        try {
            // Validate the form data
            const form = await superValidate(formData, zod(LanguageSchema));
            
            if (!form.valid) {
                return fail(400, { form });
            }
            
            // Simply update the main language settings
            await localizationService.updateLanguage(form.data);
            
            return { 
                form, 
                success: true 
            };
        } catch (error) {
            console.error('Error updating language settings:', error);
            const form = await superValidate(formData, zod(LanguageSchema));
            return fail(500, { 
                form, 
                error: 'Failed to update language settings' 
            });
        }
    }
};