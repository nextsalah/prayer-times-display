import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

// Move the schema definition to be compatible with SvelteKit exports
const versionSettingsSchema = z.object({
    currentVersion: z.string(),
    updateAvailable: z.boolean(),
    autoUpdate: z.boolean(),
    betaUpdates: z.boolean(),
    updateChannel: z.enum(['stable', 'beta', 'dev']),
    secureUpdates: z.boolean(),
});

export const load: PageServerLoad = async () => {
    // Provide a default object that matches the schema exactly
    const defaultSettings = {
        currentVersion: '1.0.0',
        updateAvailable: false,
        autoUpdate: true,
        betaUpdates: false,
        updateChannel: 'stable',
        secureUpdates: true,
    } as const;

    // Use superValidate with the default object
    const form = await superValidate(defaultSettings, zod(versionSettingsSchema));
    
    return {
        title: 'Version Settings',
        form
    };
};

export const actions = {
    default: async ({ request }) => {
        const form = await superValidate(request, zod(versionSettingsSchema));
        
        if (!form.valid) {
            return fail(400, { form });
        }

        try {
            // Add your update logic here
            console.log('Updating version settings:', form.data);
            
            return {
                form,
                success: true
            };
        } catch (error) {
            return fail(500, {
                form,
                error: 'Failed to update settings'
            });
        }
    }
} satisfies Actions;