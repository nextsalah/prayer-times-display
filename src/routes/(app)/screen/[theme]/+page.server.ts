import type { PageServerLoad } from './$types';
import { appDataService } from '$lib/db/services/appDataService';
import { error } from '@sveltejs/kit';

export const load = (async ({ params }) => {
  try {
    const data = await appDataService.getAppData();
    if (!data || !data.theme) {
      throw error(500, 'Failed to load essential page data');
    }
    
    // If a specific theme is requested, override the default theme
    if (params.theme && params.theme !== data.theme.value) {
      console.log(`Loading theme override: ${params.theme}`);
      const overriddenData = await appDataService.getAppDataWithTheme(params.theme);
      
      if (!overriddenData) {
        console.error(`Theme not found: ${params.theme}`);
        throw error(404, `Theme "${params.theme}" not found`);
      }
      
      return overriddenData;
    }
    
    return data;
  } catch (e) {
    console.error('Error in page load function:', e);
    throw error(500, 'Failed to load page data');
  }
}) satisfies PageServerLoad;
