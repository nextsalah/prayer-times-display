import type { PageServerLoad, Actions } from './$types';
import { SystemService } from '$lib/db';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { SystemSettingsSchema } from '$lib/db/schemas';

export const load: PageServerLoad = async () => {
    const systemSettings = await SystemService.get();
    
    // Create form with current system settings
    const form = await superValidate(systemSettings, zod(SystemSettingsSchema));
    
    return {
        form
    };
};

export const actions: Actions = {
    default: async ({ request }) => {
        const form = await superValidate(request, zod(SystemSettingsSchema));
        
        if (!form.valid) {
            return fail(400, { form });
        }
        
        try {
            // Update only language-related settings we know exist
            // Check if these fields exist in the form data before updating
            const updateData: Record<string, any> = {};
            
            if ('language' in form.data) {
                updateData.language = form.data.language;
            }
            
            if ('useArabicPrayerNames' in form.data) {
                updateData.useArabicPrayerNames = form.data.useArabicPrayerNames;
            }
            
            await SystemService.update(updateData);
            
            return { form };
        } catch (error) {
            console.error('Error updating language settings:', error);
            return fail(500, { form, error: 'Failed to update language settings' });
        }
    }
};