import PrayerTimeCalculator, {
    nextPrayerTimeSubscribe,
    countdownToTextSubscribe,
    currentPrayerSubscribe,
    allPrayerTimesSubscribe
} from '$lib/themes/logic/prayertime_calculator';
import { writable, type Unsubscriber } from 'svelte/store';

export interface PrayerTimeState {
    nextPrayer: any;
    currentPrayer: any;
    countdownText: string;
    allPrayerTimes: any[];
    calculator: PrayerTimeCalculator | null;
}

export class PrayerSubscriptionManager {
    private nextPrayerTimeUnsubscribe: Unsubscriber | null = null;
    private countdownToTextUnsubscribe: Unsubscriber | null = null;
    private allPrayerTimesUnsubscribe: Unsubscriber | null = null;
    private currentPrayerUnsubscribe: Unsubscriber | null = null;
    
    public state = writable<PrayerTimeState>({
        nextPrayer: null,
        currentPrayer: null,
        countdownText: '--:--:--',
        allPrayerTimes: [],
        calculator: null
    });
    
    public initialize(data: any): void {
        const calculator = new PrayerTimeCalculator(data);
        
        this.state.update(s => ({
            ...s,
            calculator
        }));
        
        this.setupSubscriptions();
    }
    
    public updateCalculator(newData: any): void {
        this.cleanup();
        
        const calculator = new PrayerTimeCalculator(newData);
        
        this.state.update(s => ({
            ...s,
            calculator
        }));
        
        this.setupSubscriptions();
    }
    
    private setupSubscriptions(): void {
        this.nextPrayerTimeUnsubscribe = nextPrayerTimeSubscribe(value => {
            this.state.update(s => ({ ...s, nextPrayer: value }));
        });
        
        this.currentPrayerUnsubscribe = currentPrayerSubscribe(value => {
            this.state.update(s => ({ ...s, currentPrayer: value }));
        });

        this.countdownToTextUnsubscribe = countdownToTextSubscribe(value => {
            this.state.update(s => ({ ...s, countdownText: value }));
        });
        
        this.allPrayerTimesUnsubscribe = allPrayerTimesSubscribe(value => {
            this.state.update(s => ({ ...s, allPrayerTimes: value }));
        });
    }
    
    public cleanup(): void {
        if (this.nextPrayerTimeUnsubscribe) this.nextPrayerTimeUnsubscribe();
        if (this.countdownToTextUnsubscribe) this.countdownToTextUnsubscribe();
        if (this.allPrayerTimesUnsubscribe) this.allPrayerTimesUnsubscribe();
        if (this.currentPrayerUnsubscribe) this.currentPrayerUnsubscribe();
        
        // Clean up the calculator
        this.state.update(s => {
            if (s.calculator) {
                s.calculator.destroy();
            }
            return { ...s, calculator: null };
        });
    }
    
    public destroy(): void {
        this.cleanup();
    }
}
