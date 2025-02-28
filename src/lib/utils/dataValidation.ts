import type { PrayerTime } from '$lib/db/schemas/prayer/prayer-times.schema';

export function validatePrayerTimes(prayerTimesList: PrayerTime[]): PrayerTime[] {
  if (prayerTimesList === null) {
    throw new Error('Failed to get prayer times data from the database');
  }
  if (prayerTimesList.length < 3) {
    throw new Error('Not enough prayer times data in the database');
  }

  return prayerTimesList;
}
