import type { PageServerLoad } from "./$types";
import { db } from "$lib/db/db.server";
import { prayertimes  } from "$lib/db/schema";
import { lt , desc } from "drizzle-orm";

export const load = (async () => {
  const componentPath: string = "default";

  const prayerTimes = await db.query.prayertimes.findMany({
    where: lt(prayertimes.date, new Date()),
    orderBy: [desc(prayertimes.date)],
    limit: 3,
  });

  return {
    prayerTimes: prayerTimes,
    componentPath: componentPath,
  };
}) satisfies PageServerLoad;