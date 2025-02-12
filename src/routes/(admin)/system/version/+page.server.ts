import type { PageServerLoad } from './$types';
import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';

const VersionSettingsSchema = z.object({
    currentVersion: z.string(),
    updateAvailable: z.boolean(),
    autoUpdate: z.boolean(),
    betaUpdates: z.boolean(),
    updateChannel: z.enum(['stable', 'beta', 'dev']),
    secureUpdates: z.boolean(),
});

export const load = (async () => {
    // Replace this with your actual data fetching
    const settings: Partial<z.infer<typeof VersionSettingsSchema>> = {
        currentVersion: '1.0.0',
        updateAvailable: true,
        autoUpdate: true,
        betaUpdates: false,
        updateChannel: 'stable',
        secureUpdates: true,
    };

    const form = await superValidate(settings, zod(VersionSettingsSchema));
    
    return {
        form
    };
}) satisfies PageServerLoad;

export const actions = {
    default: async ({ request }) => {
        const form = await superValidate(request, zod(VersionSettingsSchema));
        
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
};