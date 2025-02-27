import type { Actions, PageServerLoad } from './$types';
import { prayerConfigService } from '$lib/db';
import type { Prayer } from '$lib/db/schemas';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { z } from 'zod';

// Create a validation schema that includes all possible fields
const formValidationSchema = z.object({
    showIqamah: z.boolean(),
    iqamah: z.number().int().min(0).max(60),
    iqamahAfterPrayer: z.boolean(),
    offset: z.number().int().min(-60).max(60),
    isFixed: z.boolean(),
    fixedTime: z.string(),
    // These are for Fajr but we include them in the schema for all prayers
    calculateIqamahFromSunrise: z.boolean().optional().default(false),
    sunriseOffset: z.number().int().min(-120).max(0).optional().default(0)
});

export const load = (async ({ params }) => {
    try {
        const prayerName = params.prayer as Prayer;
        
        // Validate that the prayer name is valid
        if (!['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].includes(prayerName)) {
            throw new Error(`Invalid prayer name: ${prayerName}`);
        }
        
        const settings = await prayerConfigService.getPrayer(prayerName);

        // Create a copy of settings that we can safely modify without type errors
        const enhancedSettings = { ...settings } as any;
        
        // For Fajr, ensure the specific fields are present
        if (prayerName === 'fajr') {
            enhancedSettings.calculateIqamahFromSunrise = 
                typeof enhancedSettings.calculateIqamahFromSunrise === 'boolean' 
                    ? enhancedSettings.calculateIqamahFromSunrise 
                    : false;
                    
            enhancedSettings.sunriseOffset = 
                typeof enhancedSettings.sunriseOffset === 'number' 
                    ? enhancedSettings.sunriseOffset 
                    : -30;
        }
        
        const form = await superValidate(enhancedSettings, zod(formValidationSchema));
        
        return {
            title: prayerName.charAt(0).toUpperCase() + prayerName.slice(1),
            prayerName,
            form,
        };
    } catch (error) {
        console.error('Error loading prayer settings:', error);
        const form = await superValidate(zod(formValidationSchema));
        
        return {
            title: params.prayer,
            prayerName: params.prayer as Prayer,
            form,
            error: "Failed to load prayer settings"
        };
    }
}) satisfies PageServerLoad;

export const actions = {
    default: async ({ request, params }) => {
        const formData = await request.formData();
        const prayerName = params.prayer as Prayer;
        
        try {
            const form = await superValidate(formData, zod(formValidationSchema));
            
            // Manual validation for fixedTime if isFixed is true
            if (form.data.isFixed && (!form.data.fixedTime || !form.data.fixedTime.match(/^([01]?\d|2[0-3]):[0-5]\d$/))) {
                form.valid = false;
                form.errors.fixedTime = ["Valid time format (HH:mm) is required when fixed time is enabled"];
                return fail(400, { form });
            }
            
            if (!form.valid) {
                console.error('Form validation failed:', form.errors);
                return fail(400, { form });
            }
            
            // Create an update object with the form data
            const updateData = { ...form.data };
            
            // Ensure proper types for all fields
            updateData.showIqamah = Boolean(updateData.showIqamah);
            updateData.iqamah = Number(updateData.iqamah);
            updateData.iqamahAfterPrayer = Boolean(updateData.iqamahAfterPrayer);
            updateData.offset = Number(updateData.offset);
            updateData.isFixed = Boolean(updateData.isFixed);
            
            // For non-Fajr prayers, always include Fajr-specific fields with default values
            if (prayerName !== 'fajr') {
                updateData.calculateIqamahFromSunrise = false;
                updateData.sunriseOffset = 0;
            } else {
                // For Fajr, ensure the specific fields are properly typed and present
                updateData.calculateIqamahFromSunrise = Boolean(updateData.calculateIqamahFromSunrise);
                updateData.sunriseOffset = Number(updateData.sunriseOffset || 0);
            }
            
            console.log(`Updating ${prayerName} settings:`, updateData);
            
            // Update prayer settings
            await prayerConfigService.updatePrayer(prayerName, updateData);
            
            return { 
                form,
                success: `${prayerName.charAt(0).toUpperCase() + prayerName.slice(1)} settings updated successfully`
            };
            
        } catch (error) {
            console.error('Error updating prayer settings:', error);
            const form = await superValidate(formData, zod(formValidationSchema));
            
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return fail(500, { 
                form, 
                error: `Failed to update ${prayerName} settings: ${errorMessage}`
            });
        }
    }
} satisfies Actions;