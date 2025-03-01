import { error } from "@sveltejs/kit";
import type { Actions } from "./$types";
import type { ILocation } from "$lib/nextsalah_api/interfaces";
import {
  insertPrayerTime,
  prayertimes as prayertimesTable,
  type InsertPrayerTime,
} from "$lib/db/schemas/prayer/prayer-times.schema";
import NextSalahAPI from "$lib/nextsalah_api/handler";
import { logger } from "$lib/server/logger";
import { db } from "$lib/db/db.server";

export const load = async () => {
  return {
    title: "Sources", 
  };
};
export const actions: Actions = {
  default: async ({ request }) => {
    // Convert FormData to JSON
    logger.info("Fetching prayer times...");
    const formData = await request.formData();
    const source = formData.get("source") as string;
    const prayertimes = new NextSalahAPI(source);

    // Convert formData to JSON
    let data = Object.fromEntries(formData.entries());
    if (Object.keys(data).length === 0) {
      throw error(400, "Invalid data");
    }

    // Remove 'source' from data
    delete data.source;

    // Get prayer times
    const result = await prayertimes.get_location(data as ILocation);

    if (result.error) {
      throw error(Number(result.error.status) || 500, result.error.message);
    }
    if (!result.data) {
      throw error(500, "No data returned");
    }

    const formatStringTime = (time: string): string => {
      const [hour, minute] = time.split(":");
      return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
    };

    logger.info(
      `Fetched successfully\nSource: ${source}, Location: ${JSON.stringify(data)}`,
    );
    
    let validatedPrayerData: InsertPrayerTime[] = [];
    
    for (const prayer of result.data.prayertimes) {
      const prayerObj = {
        date: new Date(prayer.date),
        fajr: formatStringTime(prayer.fajr),
        sunrise: formatStringTime(prayer.sunrise),
        dhuhr: formatStringTime(prayer.dhuhr),
        asr: formatStringTime(prayer.asr),
        maghrib: formatStringTime(prayer.maghrib),
        isha: formatStringTime(prayer.isha),
      };
      
      // Validate each prayer time entry
      const parseResult = insertPrayerTime.safeParse(prayerObj);
      if (parseResult.success) {
        validatedPrayerData.push(parseResult.data);
      } else {
        logger.error(
          "Validation failed for a prayer time entry, skipping.",
        );
        logger.error(parseResult.error);
      }
    }

    try {
      logger.info(`Attempting to insert ${validatedPrayerData.length} prayer times`);
      
      // Use individual inserts with conflict handling instead of bulk operation
      let addedCount = 0;
      
      for (const prayer of validatedPrayerData) {
        try {
          await db.insert(prayertimesTable)
            .values(prayer)
            .onConflictDoNothing()
            .execute();
          addedCount++;
        } catch (err) {
          // Just log and continue with the next one
          logger.debug(`Skipped duplicate prayer time for ${prayer.date.toISOString().split('T')[0]}`);
        }
      }
      
      const skippedCount = validatedPrayerData.length - addedCount;
      logger.info(`Prayer times saved successfully! ✅ (Added ${addedCount}, skipped ${skippedCount})`);
      
      return {
        status: 200,
        body: {
          success: true,
          message: `Prayer times saved successfully (added ${addedCount}, skipped ${skippedCount})`,
        },
      };
    } catch (e) {
      logger.error("Failed to save prayer times");
      logger.error(e);
      throw error(500, "Failed to save prayer times");
    }
  },
};