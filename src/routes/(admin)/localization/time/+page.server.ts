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
            // Update only time-related settings, preserving other settings
            const updateData: Record<string, any> = {};
            
            if ('timezone' in form.data) {
                updateData.timezone = form.data.timezone;
            }
            
            if ('use24Hour' in form.data) {
                updateData.use24Hour = form.data.use24Hour;
            }
            
            if ('showSeconds' in form.data) {
                updateData.showSeconds = form.data.showSeconds;
            }
            
            await SystemService.update(updateData);
            
            return { form };
        } catch (error) {
            console.error('Error updating time format settings:', error);
            return fail(500, { form, error: 'Failed to update time format settings' });
        }
    }
};