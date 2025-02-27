import type { PageServerLoad, Actions } from './$types';
import { SystemService, languageService } from '$lib/db';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { SystemSettingsSchema, LanguageSchema } from '$lib/db/schemas';
import { languageConfigs } from '$lib/config/languageConfiguration';

export const load: PageServerLoad = async () => {
    const systemSettings = await SystemService.get();
    
    // Load any existing customizations
    const customizations = await languageService.getCustomizations(currentLanguage);
    
    // Create form with current system settings
    const form = await superValidate(systemSettings, zod(SystemSettingsSchema));
    
    return {
        form,
        customizations
    };
};

export const actions: Actions = {
    default: async ({ request }) => {
        const formData = await request.formData();
        const selectedLanguage = formData.get('language') as string;
        const customizations = Object.fromEntries(
            Array.from(formData.entries())
                .filter(([key]) => key !== 'language' && key !== 'touched' && key !== 'valid')
        );

        try {
            // Only save customizations that differ from defaults
            const defaultSettings = languageConfigs[selectedLanguage]?.settings || {};
            const customizedValues = Object.fromEntries(
                Object.entries(customizations)
                    .filter(([key, value]) => value !== defaultSettings[key])
            );

            if (Object.keys(customizedValues).length > 0) {
                await languageService.saveCustomizations(selectedLanguage, {
                    language_code: selectedLanguage,
                    ...customizedValues
                });
            }

            const form = await superValidate(formData, zod(SystemSettingsSchema));
            return { form, success: true };
        } catch (error) {
            console.error('Error updating language settings:', error);
            const form = await superValidate(formData, zod(SystemSettingsSchema));
            return fail(500, { form, error: 'Failed to update language settings' });
        }
    }
};