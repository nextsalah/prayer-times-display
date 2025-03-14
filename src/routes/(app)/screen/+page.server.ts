import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { themeService } from '$lib/db';

export const load = (async () => {
  const { themeName } = await themeService.get();
  if (!themeName) {
    throw redirect(307, '/screen/default');
  }
  throw redirect(307, `/screen/${themeName}`);
}) satisfies PageServerLoad;
