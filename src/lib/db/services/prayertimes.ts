// src/lib/db/services/prayertime.ts
import { db } from '$lib/db/db.server';
import { prayertimes, type PrayerTime } from '$lib/db/schemas/prayer/prayer-times.schema';
import { desc, asc, and, between, eq, sql } from 'drizzle-orm';

export type PrayerName = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
export const PRAYER_NAMES: PrayerName[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

export class PrayerTimesService {
  // Simple in-memory cache
  private cache: Map<string, {data: PrayerTime, timestamp: number}> = new Map();
  private CACHE_TTL = 3600000; // 1 hour in milliseconds

  /**
   * Get prayer times for current day and the next two days in a single query
   */
  async getPrayerTimes() {
    // Create dates using local time, not UTC
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    try {
      const prayerTimesList = await this.getPrayerTimesForRange(startOfToday, 3);
      
      // Map results to appropriate days
      const todayStr = this.formatDateString(startOfToday);
      const tomorrowDate = new Date(startOfToday);
      tomorrowDate.setDate(tomorrowDate.getDate() + 1);
      const tomorrowStr = this.formatDateString(tomorrowDate);
      const dayAfterDate = new Date(startOfToday);
      dayAfterDate.setDate(dayAfterDate.getDate() + 2);
      const dayAfterStr = this.formatDateString(dayAfterDate);
      
      // Find the prayer times for each day
      const todayPrayer = prayerTimesList.find(p => this.formatDateString(new Date(p.date)) === todayStr) || 
                         await this.findPrayerTimeWithYearFallback(startOfToday);
      const tomorrowPrayer = prayerTimesList.find(p => this.formatDateString(new Date(p.date)) === tomorrowStr) || 
                            await this.findPrayerTimeWithYearFallback(tomorrowDate);
      const dayAfterPrayer = prayerTimesList.find(p => this.formatDateString(new Date(p.date)) === dayAfterStr) || 
                           await this.findPrayerTimeWithYearFallback(dayAfterDate);
      
      return {
        today: todayPrayer,
        tomorrow: tomorrowPrayer,
        dayAfterTomorrow: dayAfterPrayer
      };
    } catch (error) {
      console.error("Failed to get prayer times:", error);
      // Fall back to individual queries if bulk query fails
      const todayPrayer = await this.getPrayerTimeForDate(now);
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowPrayer = await this.getPrayerTimeForDate(tomorrow);
      const dayAfter = new Date(now);
      dayAfter.setDate(dayAfter.getDate() + 2);
      const dayAfterPrayer = await this.getPrayerTimeForDate(dayAfter);
      
      return {
        today: todayPrayer,
        tomorrow: tomorrowPrayer,
        dayAfterTomorrow: dayAfterPrayer
      };
    }
  }
  
  /**
   * Get prayer times for a specific date range with enhanced year transition handling
   */
  async getPrayerTimesForRange(startDate: Date, days: number = 7): Promise<PrayerTime[]> {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (days - 1));
    
    // Format dates to ensure consistent comparison
    const formattedStartDate = this.formatDateForDB(startDate);
    const formattedEndDate = this.formatDateForDB(endDate);
    
    try {
      // First try finding prayer times in the requested date range
      let prayerTimesList = await db.query.prayertimes.findMany({
        where: (fields, { and, between, or }) => and(
          or(
            between(fields.date, new Date(formattedStartDate), new Date(formattedEndDate)),
            // Also try to match by month-day pattern for recurring annual prayers
            sql`STRFTIME('%m-%d', ${fields.date}) BETWEEN STRFTIME('%m-%d', ${formattedStartDate}) AND STRFTIME('%m-%d', ${formattedEndDate})`
          )
        ),
        orderBy: [asc(prayertimes.date)],
      });
      
      if (prayerTimesList.length === 0) {
        console.warn(`No prayer times found for date range ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`);
      }
      
      return prayerTimesList;
    } catch (error) {
      console.error(`Error querying prayer times range:`, error);
      throw new Error(`Failed to retrieve prayer times for the specified date range`);
    }
  }
  
  /**
   * Find prayer time for a date with year fallback support
   * This is especially helpful during year transitions
   */
  async findPrayerTimeWithYearFallback(date: Date): Promise<PrayerTime> {
    // First try the exact date
    const exactMatch = await this.getPrayerTimeByExactDate(date);
    if (exactMatch) return exactMatch;
    
    // Try closest date in current year
    const closestMatch = await this.findClosestPrayerTime(date);
    if (closestMatch) return closestMatch;
    
    // Try month-day pattern (across any year)
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const monthDayFormat = `${month}-${day}`;
    
    const monthDayMatch = await this.getPrayerTimeByMonthDay(monthDayFormat);
    if (monthDayMatch) return monthDayMatch;
    
    // Try previous years (working backwards up to 5 years)
    for (let yearOffset = 1; yearOffset <= 5; yearOffset++) {
      const previousYearDate = new Date(date);
      previousYearDate.setFullYear(date.getFullYear() - yearOffset);
      
      // Try exact date match from previous year
      const previousYearMatch = await this.getPrayerTimeByExactDate(previousYearDate);
      if (previousYearMatch) return previousYearMatch;
      
      // Try month-day match from previous year
      const previousYearMonthDayMatch = await this.getPrayerTimeByMonthDay(monthDayFormat, date.getFullYear() - yearOffset);
      if (previousYearMonthDayMatch) return previousYearMonthDayMatch;
    }
    
    // If all else fails, find the most recent prayer time for any date
    const fallbackTime = await this.getLatestPrayerTime();
    if (fallbackTime) return fallbackTime;
    
    // Instead of throwing an error, return example prayer times
    console.warn(`No prayer times found for date ${date.toLocaleDateString()}, returning example times`);
    return this.getExamplePrayerTime(date);
  }
  
  /**
   * Get prayer time for a specific date with enhanced fallback mechanisms
   */
  async getPrayerTimeForDate(date: Date): Promise<PrayerTime> {
    const dateStr = this.formatDateString(date);
    const cacheKey = `prayer-${dateStr}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    
    try {
      const result = await this.findPrayerTimeWithYearFallback(date);
      this.updateCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error(`Failed to retrieve prayer times: ${error}`);
      // Return example prayer times instead of throwing an error
      const exampleTimes = this.getExamplePrayerTime(date);
      this.updateCache(cacheKey, exampleTimes);
      return exampleTimes;
    }
  }
  
  /**
   * Generate example prayer times for a given date
   * This is used as a fallback when no prayer times can be found in the database
   */
  private getExamplePrayerTime(date: Date): PrayerTime {
    // Format the date as ISO string without time part
    const dateString = this.formatDateString(date);
    
    // Generate example prayer times - these are typical times that might be reasonable
    // but should be replaced with actual prayer times when available
    return {
      id: -1, // Use negative ID to indicate this is an example
      date: new Date(dateString),
      fajr: '05:30',
      sunrise: '07:00',
      dhuhr: '12:30',
      asr: '15:45',
      maghrib: '19:30',
      isha: '21:00'
    };
  }
  
  /**
   * Get current prayer and next prayer time
   */
  async getCurrentAndNextPrayer(): Promise<{
    current: PrayerName;
    next: PrayerName;
    currentTime: string;
    nextTime: string;
  }> {
    const now = new Date();
    const todayPrayer = await this.getPrayerTimeForDate(now);
    
    const prayerTimes = PRAYER_NAMES.map(name => ({
      name,
      time: this.parseTimeString(todayPrayer[name])
    }));
    
    // Sort prayer times chronologically
    prayerTimes.sort((a, b) => a.time.getTime() - b.time.getTime());
    
    // Default to last prayer of the day
    let current = prayerTimes[prayerTimes.length - 1]; 
    // Default to first prayer of the next day
    let next = prayerTimes[0]; 
    
    const currentTimeMs = now.getHours() * 3600000 + now.getMinutes() * 60000 + now.getSeconds() * 1000;
    let foundNext = false;
    
    for (let i = 0; i < prayerTimes.length; i++) {
      const prayer = prayerTimes[i];
      const prayerTimeMs = prayer.time.getHours() * 3600000 + prayer.time.getMinutes() * 60000;
      
      if (currentTimeMs < prayerTimeMs) {
        if (i > 0) {
          current = prayerTimes[i - 1];
        } else {
          // Before first prayer of the day, so current is last prayer of previous day
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayPrayer = await this.getPrayerTimeForDate(yesterday);
          current = {
            name: 'isha',
            time: this.parseTimeString(yesterdayPrayer.isha)
          };
        }
        next = prayer;
        foundNext = true;
        break;
      }
    }
    
    // Handle case when we're after the last prayer of the day
    let nextTime: string;
    if (!foundNext) {
      // Get tomorrow's first prayer time
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowPrayer = await this.getPrayerTimeForDate(tomorrow);
      nextTime = tomorrowPrayer.fajr;
    } else {
      nextTime = todayPrayer[next.name];
    }
    
    return {
      current: current.name,
      next: next.name,
      currentTime: todayPrayer[current.name],
      nextTime: nextTime
    };
  }
  
  /**
   * Find the closest available prayer time to the given date
   */
  private async findClosestPrayerTime(targetDate: Date): Promise<PrayerTime | null> {
    try {
      const startDate = new Date(targetDate);
      startDate.setDate(startDate.getDate() - 7); // Look 7 days before
      
      const endDate = new Date(targetDate);
      endDate.setDate(endDate.getDate() + 7); // Look 7 days after
      
      // Convert string dates to Date objects
      const startDateObj = new Date(this.formatDateForDB(startDate));
      const endDateObj = new Date(this.formatDateForDB(endDate));
      
      const results = await db.query.prayertimes.findMany({
        where: (fields, { and, between }) => and(
          between(fields.date, startDateObj, endDateObj)
        ),
        orderBy: (fields, { asc }) => [asc(fields.date)]
      });
      
      if (results.length === 0) return null;
      
      // Find the closest date to our target date
      const targetTime = targetDate.getTime();
      return results.reduce((closest, current) => {
        const closestDiff = Math.abs(new Date(closest.date).getTime() - targetTime);
        const currentDiff = Math.abs(new Date(current.date).getTime() - targetTime);
        return currentDiff < closestDiff ? current : closest;
      });
    } catch (error) {
      console.error(`Error finding closest prayer time:`, error);
      return null;
    }
  }
  
  /**
   * Try to get prayer times by exact date match
   */
  private async getPrayerTimeByExactDate(date: Date): Promise<PrayerTime | null> {
    try {
      // Format date for database query
      const formattedDate = this.formatDateForDB(date);
      
      const result = await db.query.prayertimes.findFirst({
        where: (fields, { eq }) => eq(fields.date, new Date(formattedDate)),
      });
      
      return result || null;
    } catch (error) {
      console.error(`Error querying exact date match:`, error);
      return null;
    }
  }
  
  /**
   * Get prayer times by month and day, optionally filtering by year
   * This helps with finding prayer times from previous years for the same calendar day
   */
  private async getPrayerTimeByMonthDay(monthDayPattern: string, specificYear?: number): Promise<PrayerTime | null> {
    try {
      let query: any;
      
      if (specificYear) {
        // If a specific year is provided, find prayer times for that month-day in that year
        query = db.query.prayertimes.findMany({
          where: (fields, { and, sql }) => and(
            sql`STRFTIME('%m-%d', ${fields.date}) = ${monthDayPattern}`,
            sql`STRFTIME('%Y', ${fields.date}) = ${String(specificYear)}`
          ),
          orderBy: [desc(prayertimes.date)],
          limit: 1,
        });
      } else {
        // Otherwise, just find by month-day across all years
        query = db.query.prayertimes.findMany({
          where: (fields, { sql }) => 
            sql`STRFTIME('%m-%d', ${fields.date}) = ${monthDayPattern}`,
          orderBy: [desc(prayertimes.date)], // Get most recent matching date
          limit: 1,
        });
      }
      
      const result = await query;
      
      if (result.length > 0) return result[0];
      
      // Fallback to LIKE query if STRFTIME is not supported
      const fallbackQuery = specificYear 
        ? db.query.prayertimes.findMany({
            where: (fields, { and, sql }) => and(
              sql`CAST(${fields.date} AS TEXT) LIKE ${'%' + monthDayPattern}`,
              sql`CAST(${fields.date} AS TEXT) LIKE ${String(specificYear) + '%'}`
            ),
            orderBy: [desc(prayertimes.date)],
            limit: 1,
          })
        : db.query.prayertimes.findMany({
            where: (fields, { sql }) => 
              sql`CAST(${fields.date} AS TEXT) LIKE ${'%' + monthDayPattern}`,
            orderBy: [desc(prayertimes.date)],
            limit: 1,
          });
      
      const fallbackResult = await fallbackQuery;
      return fallbackResult.length > 0 ? fallbackResult[0] : null;
    } catch (error) {
      console.error(`Error querying by month-day pattern:`, error);
      return null;
    }
  }
  
  /**
   * Get the most recent prayer time from the database
   * This is a last-resort fallback
   */
  private async getLatestPrayerTime(): Promise<PrayerTime | null> {
    try {
      const result = await db.query.prayertimes.findMany({
        orderBy: [desc(prayertimes.date)],
        limit: 1,
      });
      
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error(`Error getting latest prayer time:`, error);
      return null;
    }
  }
  
  /**
   * Format date as YYYY-MM-DD string
   */
  private formatDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  /**
   * Format date for database queries (handles timezone issues)
   */
  private formatDateForDB(date: Date): string {
    // Ensure we're working with midnight local time
    const localDate = new Date(date);
    localDate.setHours(0, 0, 0, 0);
    return this.formatDateString(localDate);
  }
  
  /**
   * Parse time string "HH:MM" to Date object for comparison
   */
  private parseTimeString(timeStr: string): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }
  
  /**
   * Update the cache with new data
   */
  private updateCache(key: string, data: PrayerTime): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}

// Export singleton instance
export const prayerTimesService = new PrayerTimesService();