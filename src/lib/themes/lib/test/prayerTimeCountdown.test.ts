import PrayerTimeCountdown from '../prayerTimeCountdown';

const prayerTimes = new PrayerTimeCountdown();

// Add prayer times
prayerTimes.addPrayer('Fajr', '04:30');
prayerTimes.addPrayer('Dhuhr', '12:30');
prayerTimes.addPrayer('Asr', '16:00');
prayerTimes.addPrayer('Maghrib', '19:45');
prayerTimes.addPrayer('Isha', '21:15');

// Subscribe to updates
prayerTimes.subscribe(data => {
  console.clear();  // Clear console for better readability
  console.log('Next Prayer:', data.nextPrayer ? data.nextPrayer.name : 'No upcoming prayer');
  console.log('Countdown:', data.countdown);
  console.log('Time until next prayer:', prayerTimes.getTimeUntilNextPrayer());
  console.log('Islamic Date:', prayerTimes.getIslamicDate());
});

// Start the library
const intervals = prayerTimes.start();

console.log('Prayer times library started. Press Ctrl+C to exit.');

// Keep the script running
process.stdin.resume();

// Cleanup on exit
process.on('SIGINT', () => {
  clearInterval(intervals.minuteInterval);
  clearInterval(intervals.secondInterval);
  console.log('Prayer times library stopped.');
  process.exit();
});
