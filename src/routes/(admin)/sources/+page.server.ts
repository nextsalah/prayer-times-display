import { error } from "@sveltejs/kit";
import type { Actions } from "./$types";
import type { ILocation } from "$lib/nextsalah_api/interfaces";
import {
  insertPrayerTime,
  prayertimes as prayertimesTable,
  type InsertPrayerTime,
} from "$lib/db/schema";
import NextSalahAPI from "$lib/nextsalah_api/handler";
import { logger } from "$lib/server/logger";
import { db } from "$lib/db/db.server";

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
      throw error(result.error.statusCode || 400, result.error.message);
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
          "Validation failed for a prayer time entry, applying default values.",
        );
        logger.error(parseResult.error);
        continue;
      }
    }

    try {
      logger.info("Trying to removing old prayer times and add new ones 🧹");
      await db.transaction(async () => {
        await db.delete(prayertimesTable);
        await db.insert(prayertimesTable).values(validatedPrayerData);
      });
      logger.info("Prayer times saved successfully! ✅");
    } catch (e) {
      logger.error("Failed to save prayer times");
      logger.error(e);
      throw error(500, "Failed to save prayer times");
    }

    // Return success
    return {
      status: 200,
      body: {
        success: true,
        message: "Prayer times saved successfully",
      },
    };
  },
};
