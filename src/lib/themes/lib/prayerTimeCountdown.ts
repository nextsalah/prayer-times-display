type TimeString = `${number}:${number}`;

class PrayerTime {
  readonly name: string;
  readonly time: TimeString;

  constructor(name: string, time: TimeString) {
    this.name = name;
    this.time = time;
  }
}

interface ObserverData {
  nextPrayer: PrayerTime | null;
  countdown: string;
  allPrayers: PrayerTime[];
}

type ObserverCallback = (data: ObserverData) => void;

// Type alias to handle both Node.js and browser environments
type Timer = ReturnType<typeof setTimeout>;

class PrayerTimeCountdown {
  private prayerTimes: PrayerTime[] = [];
  private nextPrayer: PrayerTime | null = null;
  private countdown: string = '';
  private observers: Set<ObserverCallback> = new Set();
  private nextPrayerTime: Date | null = null;

  /**
   * Adds a prayer time to the list.
   * @param name - The name of the prayer.
   * @param time - The time of the prayer in HH:MM format.
   */
  addPrayer(name: string, time: TimeString): void {
    if (!this.isValidTimeString(time)) {
      throw new Error(`Invalid time format: ${time}`);
    }
    this.prayerTimes.push(new PrayerTime(name, time));
    this.prayerTimes.sort((a, b) => this.compareTime(a.time, b.time));
  }

  /**
   * Validates a time string in HH:MM format.
   * @param time - The time string.
   * @returns True if the time string is valid, otherwise false.
   */
  private isValidTimeString(time: string): boolean {
    const timeRegex = /^([0-1]\d|2[0-3]):([0-5]\d)$/;
    return timeRegex.test(time);
  }

  /**
   * Compares two time strings in HH:MM format.
   * @param time1 - The first time string.
   * @param time2 - The second time string.
   * @returns The difference in minutes between the two times.
   */
  private compareTime(time1: TimeString, time2: TimeString): number {
    const [hours1, minutes1] = time1.split(':').map(Number);
    const [hours2, minutes2] = time2.split(':').map(Number);
    return hours1 * 60 + minutes1 - (hours2 * 60 + minutes2);
  }

  /**
   * Updates the next prayer time based on the current time.
   */
  private updateNextPrayer(): void {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    this.nextPrayer = this.prayerTimes.find(prayer => {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      return hours * 60 + minutes > currentTime;
    }) || this.prayerTimes[0];

    const [hours, minutes] = this.nextPrayer.time.split(':').map(Number);
    this.nextPrayerTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

    if (this.nextPrayerTime < now) {
      this.nextPrayerTime.setDate(this.nextPrayerTime.getDate() + 1);
    }

    this.updateCountdown();
  }

  /**
   * Updates the countdown to the next prayer.
   */
  private updateCountdown(): void {
    if (!this.nextPrayerTime) return;

    const now = new Date();
    const diff = this.nextPrayerTime.getTime() - now.getTime();

    if (diff < 0) {
      this.updateNextPrayer();
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    this.countdown = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    this.notifyObservers();
  }

  /**
   * Subscribes a callback function to be notified of updates.
   * @param callback - The callback function.
   * @returns A function to unsubscribe the callback.
   */
  subscribe(callback: ObserverCallback): () => void {
    this.observers.add(callback);
    return () => {
      this.observers.delete(callback);
    };
  }

  /**
   * Notifies all subscribed observers of the current state.
   */
  private notifyObservers(): void {
    const data: ObserverData = {
      nextPrayer: this.nextPrayer,
      countdown: this.countdown,
      allPrayers: this.prayerTimes
    };
    this.observers.forEach(callback => callback(data));
  }

  /**
   * Starts the prayer time countdown and notification system.
   * @returns An object containing the interval timers.
   */
  start(): { minuteInterval: Timer; secondInterval: Timer } {
    this.updateNextPrayer();
    const minuteInterval = setInterval(() => {
      this.updateNextPrayer();
    }, 60000); // Update next prayer every minute

    const secondInterval = setInterval(() => {
      this.updateCountdown();
    }, 1000); // Update countdown every second

    return { minuteInterval, secondInterval };
  }

  /**
   * Gets the time remaining until the next prayer.
   * @returns A string representing the time until the next prayer.
   */
  getTimeUntilNextPrayer(): string {
    if (!this.nextPrayer) return 'No upcoming prayer';

    const [hours, minutes, seconds] = this.countdown.split(':').map(Number);
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} and ${minutes} minute${minutes > 1 ? 's' : ''} until ${this.nextPrayer.name}`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} and ${seconds} second${seconds !== 1 ? 's' : ''} until ${this.nextPrayer.name}`;
    } else {
      return `${seconds} second${seconds !== 1 ? 's' : ''} until ${this.nextPrayer.name}`;
    }
  }

  /**
   * Gets the current Islamic date.
   * @returns A string representing the Islamic date.
   */
  getIslamicDate(): string {
    const today = new Date();
    const islamicDate = new Intl.DateTimeFormat('en-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(today);
    return islamicDate;
  }
}

export default PrayerTimeCountdown;
