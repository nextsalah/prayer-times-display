import type { PageServerLoad } from './$types';
import { db } from '$lib/db/db.server';
import { prayertimes } from '$lib/db/schema';
import { lt, desc } from 'drizzle-orm';
import { validatePrayerTimes } from '$lib/utils/dataValidation';

export const load = (async () => {
  const componentPath: string = 'default';

  const prayerTimesList = await db.query.prayertimes.findMany({
    where: lt(prayertimes.date, new Date()),
    orderBy: [desc(prayertimes.date)],
    limit: 3,
  });

  const validatedPrayerTimesList = validatePrayerTimes(prayerTimesList);

  const prayerTimes = {
    today: validatedPrayerTimesList[0],
    tomorrow: validatedPrayerTimesList[1],
    dayAfterTomorrow: validatedPrayerTimesList[2],
  };

  return {
    prayerTimes: prayerTimes,
    componentPath: componentPath,
  };
}) satisfies PageServerLoad;
