import { error } from '@sveltejs/kit';
import type { PageServerLoad , Actions } from './$types';
import type { ILocation, IFetchPrayertimes } from '$lib/nextsalah_api/interfaces';
import NextSalahAPI from '$lib/nextsalah_api/handler';
import { logger } from '$lib/server/logger';
export const load = (async () => {
    return {};
}) satisfies PageServerLoad;


export const actions: Actions = {

    default: async ({ request }) => {
        // Convert FormData to JSON
        logger.info("Fetching prayer times...");    
        const formData = await request.formData();
        logger.info("Form data: ", formData);

        const source =  formData.get('source') as string;
        const prayertimes = new NextSalahAPI(source);

        // Convert formData to JSON
        let data = Object.fromEntries(formData.entries());
        if (Object.keys(data).length === 0) { 
            throw error(400, "Invalid data");
        }

        // Remove 'source' from data
        delete(data.source); 

        // Get prayer times
        const result = await prayertimes.get_location(data as ILocation);

        if (result.error) {
            throw error(result.error.statusCode || 400,  result.error.message);
        }
        if (!result.data) {
            throw error(500, "No data returned");
        }         

        const formatStringTime = (time: string) : string => {
            const [hour, minute]  = time.split(":");
            const formattedTime = `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
            return formattedTime;
        }
        logger.info(`Prayer times fetched successfully!\nSource: ${source as string}, Location: ${JSON.stringify(data)}`);
        const prayerData = result.data.prayertimes.map((prayer: IFetchPrayertimes) => {
            // Parse date and time
            return {
                date : new Date(prayer.date),
                fajr : formatStringTime(prayer.fajr),
                sunrise : formatStringTime(prayer.sunrise),
                dhuhr :  formatStringTime(prayer.dhuhr),
                asr : formatStringTime(prayer.asr),
                maghrib : formatStringTime(prayer.maghrib),
                isha : formatStringTime(prayer.isha),
            }
        });


        // Return success
        return {
            status: 200,
            body: {
                success: true,
                message: "Prayer times saved successfully",
            }
        };
    }

}