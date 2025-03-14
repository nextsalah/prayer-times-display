import type { Actions, PageServerLoad } from './$types';
import { prayerConfigService } from '$lib/db';
import type { Prayer } from '$lib/db/schemas';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { sseService } from '$lib/server/sse/service';

// Base schema for all prayers
const baseFormSchema = z.object({
    showIqamah: z.boolean(),
    iqamah: z.number().int().min(0).max(60),
    offset: z.number().int().min(-60).max(60),
    isFixed: z.boolean(),
    fixedTime: z.string().default("00:00"),
});

// Extended schema for Fajr prayer
const fajrFormSchema = baseFormSchema.extend({
    calculateIqamahFromSunrise: z.boolean().default(false),
    sunriseOffset: z.number().int().min(-120).max(0).default(-30),
});

export const load = (async ({ params }) => {
    try {
        const prayerName = params.prayer as Prayer;
        
        // Validate that the prayer name is valid
        if (!['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].includes(prayerName)) {
            throw new Error(`Invalid prayer name: ${prayerName}`);
        }
        
        // Get prayer settings from database
        const settings = await prayerConfigService.getPrayer(prayerName);
        
        // Choose the correct validation schema based on prayer type
        const schema = prayerName === 'fajr' ? fajrFormSchema : baseFormSchema;
        
        // Ensure fixedTime has a default value
        let enhancedSettings = { 
            ...settings,
            fixedTime: settings.fixedTime || "00:00"
        };
        
        // Add Fajr-specific defaults if needed
        if (prayerName === 'fajr') {
            const fajrSettings = enhancedSettings as typeof enhancedSettings & {
                calculateIqamahFromSunrise?: boolean;
                sunriseOffset?: number;
            };
            fajrSettings.calculateIqamahFromSunrise = 
                fajrSettings.calculateIqamahFromSunrise ?? false;
            fajrSettings.sunriseOffset = 
                fajrSettings.sunriseOffset ?? -30;
            enhancedSettings = fajrSettings;
        }
        
        // Validate form with the appropriate schema
        const form = await superValidate(enhancedSettings, zod(schema));
        
        return {
            title: prayerName.charAt(0).toUpperCase() + prayerName.slice(1),
            prayerName,
            form,
            isFajr: prayerName === 'fajr'
        };
    } catch (error) {
        console.error('Error loading prayer settings:', error);
        
        // Choose schema based on prayer name even in error case
        const isFajr = params.prayer === 'fajr';
        const schema = isFajr ? fajrFormSchema : baseFormSchema;
        const form = await superValidate(zod(schema));
        
        return {
            title: params.prayer,
            prayerName: params.prayer as Prayer,
            form,
            isFajr,
            error: "Failed to load prayer settings"
        };
    }
}) satisfies PageServerLoad;

export const actions = {
    default: async ({ request, params }) => {
        const formData = await request.formData();
        const prayerName = params.prayer as Prayer;
        const isFajr = prayerName === 'fajr';
        
        try {
            // Select the appropriate schema based on prayer type
            const schema = isFajr ? fajrFormSchema : baseFormSchema;
            const form = await superValidate(formData, zod(schema));
            
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
            
            // If not using fixed time, ensure fixedTime has a default value but don't save it
            if (!form.data.isFixed) {
                form.data.fixedTime = "00:00";
            }
            
            // Create a typed update object based on form data
            const updateData = { ...form.data };
            
            // Ensure proper types for all fields
            updateData.showIqamah = Boolean(updateData.showIqamah);
            updateData.iqamah = Number(updateData.iqamah);
            updateData.offset = Number(updateData.offset);
            updateData.isFixed = Boolean(updateData.isFixed);
            
            // Add type field to match the schema
            const dataWithType = {
                ...updateData,
                type: prayerName
            };
            
            // For Fajr, ensure the specific fields are properly typed and present
            if (isFajr && 'calculateIqamahFromSunrise' in updateData) {
                const fajrData = updateData as z.infer<typeof fajrFormSchema>;
                fajrData.calculateIqamahFromSunrise = Boolean(fajrData.calculateIqamahFromSunrise);
                fajrData.sunriseOffset = Number(fajrData.sunriseOffset || -30);
            }
            
            // Update prayer settings
            await prayerConfigService.updatePrayer(prayerName, updateData);
            sseService.updateContent('Changed Prayer Config');
            return { 
                form,
                success: `${prayerName.charAt(0).toUpperCase() + prayerName.slice(1)} settings updated successfully`
            };
            
        } catch (error) {
            console.error('Error updating prayer settings:', error);
            
            // Select the appropriate schema based on prayer type
            const schema = isFajr ? fajrFormSchema : baseFormSchema;
            const form = await superValidate(formData, zod(schema));
            
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return fail(500, { 
                form, 
                error: `Failed to update ${prayerName} settings: ${errorMessage}`
            });
        }
    }
} satisfies Actions;