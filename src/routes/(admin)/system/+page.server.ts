import type { PageServerLoad } from './$types';
import { SystemService } from '$lib/db';
import { SystemSettingsSchema } from '$lib/db/schemas';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';

export const load = (async () => {
  const settings = await SystemService.get();
  const form = await superValidate(settings, zod(SystemSettingsSchema));
  return {
      title: "System Settings",
      form
  };
}) satisfies PageServerLoad;

export const actions = {
  default: async ({ request }) => {
    const form = await superValidate(request, zod(SystemSettingsSchema));
    console.log('form:', form);
      
      if (!form.valid) {
          return fail(400, { form });
      }

      try {
          const updatedSettings = await SystemService.update(form.data);
          const newForm = await superValidate(updatedSettings, zod(SystemSettingsSchema));
          return { form: newForm, success: true };
      } catch (e) {
          console.error('Failed to update system settings:', e);
          return fail(500, { 
              form,
              error: 'Failed to update settings. Please try again.'
          });
      }
  }
};