// src/lib/db/services/prayertime.ts
import { db } from '$lib/db/db.server';
import { prayertimes, type PrayerTime } from '$lib/db/schemas/prayer/prayer-times.schema';
import { desc, and, between, eq, sql } from 'drizzle-orm';

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
    
    // Get 3 days at once to reduce database calls
    const endDate = new Date(startOfToday);
    endDate.setDate(endDate.getDate() + 2);
    
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
                         await this.findClosestPrayerTime(startOfToday);
      const tomorrowPrayer = prayerTimesList.find(p => this.formatDateString(new Date(p.date)) === tomorrowStr) || 
                            await this.findClosestPrayerTime(tomorrowDate);
      const dayAfterPrayer = prayerTimesList.find(p => this.formatDateString(new Date(p.date)) === dayAfterStr) || 
                           await this.findClosestPrayerTime(dayAfterDate);
      
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
   * Get prayer times for a specific date range
   */
  async getPrayerTimesForRange(startDate: Date, days: number = 7) {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (days - 1));
    
    // Format dates to ensure consistent comparison
    const formattedStartDate = this.formatDateForDB(startDate);
    const formattedEndDate = this.formatDateForDB(endDate);
    
    try {
      const prayerTimesList = await db.query.prayertimes.findMany({
        where: (fields, { and, between, or }) => and(
          or(
            between(fields.date, new Date(formattedStartDate), new Date(formattedEndDate)),
            // Also try to match by month-day pattern for recurring annual prayers
            sql`STRFTIME('%m-%d', ${fields.date}) BETWEEN STRFTIME('%m-%d', ${formattedStartDate}) AND STRFTIME('%m-%d', ${formattedEndDate})`
          )
        ),
        orderBy: [desc(prayertimes.date)],
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
   * Get prayer time for a specific date with caching and improved fallbacks
   */
  async getPrayerTimeForDate(date: Date): Promise<PrayerTime> {
    const dateStr = this.formatDateString(date);
    const cacheKey = `prayer-${dateStr}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    
    // Try getting prayer time with various strategies
    try {
      // Strategy 1: Exact date match
      const exactMatch = await this.getPrayerTimeByExactDate(date);
      if (exactMatch) {
        this.updateCache(cacheKey, exactMatch);
        return exactMatch;
      }
      
      // Strategy 2: Find closest date in the same year
      const closestMatch = await this.findClosestPrayerTime(date);
      if (closestMatch) {
        this.updateCache(cacheKey, closestMatch);
        return closestMatch;
      }
      
      // Strategy 3: Fall back to month-day pattern for recurring annual prayers
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const monthDayFormat = `${month}-${day}`;
      
      const partialMatch = await this.getPrayerTimeByPartialDate(monthDayFormat);
      if (partialMatch) {
        this.updateCache(cacheKey, partialMatch);
        return partialMatch;
      }
      
      // If all lookups fail, throw an error
      throw new Error(`No prayer times found for date ${date.toLocaleDateString()}`);
    } catch (error) {
      console.error(`Error retrieving prayer time for ${dateStr}:`, error);
      throw new Error(`Failed to retrieve prayer times for ${dateStr}`);
    }
  }
  
  /**
   * Get current prayer and next prayer time
   */
  async getCurrentAndNextPrayer(): Promise<{current: string, next: string, currentTime: string, nextTime: string}> {
    const now = new Date();
    const todayPrayer = await this.getPrayerTimeForDate(now);
    
    type PrayerName = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
    const prayerNames: PrayerName[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
    const prayerTimes = prayerNames.map(name => ({
      name,
      time: this.parseTimeString(todayPrayer[name])
    }));
    
    // Sort prayer times chronologically
    prayerTimes.sort((a, b) => a.time.getTime() - b.time.getTime());
    
    let current = prayerTimes[prayerTimes.length - 1]; // Default to last prayer
    let next = prayerTimes[0]; // Default to first prayer (for next day)
    
    // Ensure type safety for prayer names
    const isValidPrayerName = (name: string): name is PrayerName => {
      return prayerNames.includes(name as PrayerName);
    };
    let next = prayerTimes[0]; // Default to first prayer (for next day)
    
    const currentTimeMs = now.getHours() * 3600000 + now.getMinutes() * 60000 + now.getSeconds() * 1000;
    
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
        break;
      }
    }
    
    // Check if we're after the last prayer of the day
    if (current === prayerTimes[prayerTimes.length - 1] && next === prayerTimes[0]) {
      // Get tomorrow's first prayer
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowPrayer = await this.getPrayerTimeForDate(tomorrow);
    // Ensure prayer names are valid before accessing
    if (!isValidPrayerName(current.name) || !isValidPrayerName(next.name)) {
      throw new Error(`Invalid prayer name: ${current.name} or ${next.name}`);
    }
    
    return {
      current: current.name,
      next: next.name,
      currentTime: todayPrayer[current.name],
      nextTime: next.name === 'fajr' && current.name === 'isha' ? 
        (await this.getPrayerTimeForDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1))).fajr : 
        todayPrayer[next.name]
    };
      next: next.name,
      currentTime: todayPrayer[current.name],
      nextTime: next.name === 'fajr' && current.name === 'isha' ? 
        (await this.getPrayerTimeForDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1))).fajr : 
        todayPrayer[next.name]
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
   * Try to get prayer times by month-day pattern
   */
  private async getPrayerTimeByPartialDate(datePattern: string): Promise<PrayerTime | null> {
    try {
      // Try STRFTIME for month-day pattern
      const result = await db.query.prayertimes.findMany({
        where: (fields, { sql }) => 
          sql`STRFTIME('%m-%d', ${fields.date}) = ${datePattern}`,
        orderBy: [desc(prayertimes.date)], // Get most recent matching date
        limit: 1,
      });
      
      if (result.length > 0) return result[0];
      
      // Fallback to LIKE query if STRFTIME is not supported
      const fallbackResult = await db.query.prayertimes.findMany({
        where: (fields, { sql }) => 
          sql`CAST(${fields.date} AS TEXT) LIKE ${'%' + datePattern}`,
        orderBy: [desc(prayertimes.date)],
        limit: 1,
      });
      
      return fallbackResult.length > 0 ? fallbackResult[0] : null;
    } catch (error) {
      console.error(`Error querying partial date:`, error);
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