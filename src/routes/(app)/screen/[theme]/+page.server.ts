import type { PageServerLoad } from './$types';
import { appDataService } from '$lib/db/services/appDataService';
import { error } from '@sveltejs/kit';
import { ThemeManager } from '$lib/themes/logic/handler';

export const load = (async ({ params }) => {
  try {
    // Get theme from URL parameter
    const themeFromUrl = params.theme;

    // Get app data
    const data = await appDataService.getAppData();
    if(!data){
      throw error(500, 'Failed to load data from database');
    }
    
    // If theme is specified in URL, override the default theme
    const themePath = themeFromUrl || data.componentPath;
    
    if (!ThemeManager.themeExists(themePath)) {
      throw error(404, 'Theme not found');
    }
    return {
      data,
      themePath
    };
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    throw error(500, errorMessage);
  }
}) satisfies PageServerLoad;