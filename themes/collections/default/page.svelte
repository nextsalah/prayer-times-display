<script lang="ts">
    import type { ScreenPageServerLoad } from "../../constants/types";
    import type PrayerTimeCalculator from "../../logic/prayertime_calculator";
    import Time from "../../components/Time.svelte";
    import { countdownToTextSubscribe, nextPrayerTimeSubscribe } from "../../logic/prayertime_calculator";
 
    interface Props {
        data: ScreenPageServerLoad<any>;
        calculator: PrayerTimeCalculator | null;
    }

    let { data, calculator }: Props = $props();
    console.log(data.apiData.custom_settings)
    let nextPrayerTime = $state(null);
    let countdownToText = $state(null);

    // Subscribe to prayer time updates
    $effect(() => {
        if (calculator) {
            const unsubNext = nextPrayerTimeSubscribe((value) => nextPrayerTime = value);
            const unsubCount = countdownToTextSubscribe((value) => countdownToText = value);
            return () => {
                unsubNext();
                unsubCount();
            };
        }
    });
</script>

<style>
    .mosque-bg {
        background: linear-gradient(135deg, #1e4a5f 0%, #0d2c3d 100%);
        position: relative;
        overflow: hidden;
    }
    
    .mosque-bg::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 
            radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.03) 0%, transparent 60%),
            url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M60 20c22.1 0 40 17.9 40 40s-17.9 40-40 40-40-17.9-40-40 17.9-40 40-40zm0 10c-16.5 0-30 13.5-30 30s13.5 30 30 30 30-13.5 30-30-13.5-30-30-30zm0 7.5l25.98 15v30L60 97.5l-25.98-15v-30L60 37.5z' fill='rgba(255,255,255,0.03)'/%3E%3C/svg%3E");
        opacity: 0.2;
        z-index: 0;
    }

    /* Dome decorative element */
    .dome {
        position: absolute;
        width: 40vh;
        height: 40vh;
        top: -20vh;
        left: 50%;
        transform: translateX(-50%);
        background: radial-gradient(ellipse at 50% 100%, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
        border-radius: 50% 50% 0 0;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        z-index: 0;
    }

    .clock-wrapper {
        position: relative;
        padding: 2rem;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 2rem;
        box-shadow: 
            0 4px 6px rgba(0, 0, 0, 0.1),
            0 20px 40px rgba(0, 0, 0, 0.2),
            inset 0 0 0 1px rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
    }

    .clock-time {
        font-family: 'SF Mono', 'Monaco', monospace;
        text-shadow: 
            0 0 20px rgba(255, 255, 255, 0.2),
            0 0 40px rgba(255, 255, 255, 0.1);
        font-variant-numeric: tabular-nums;
        letter-spacing: -0.02em;
    }

    .date-display {
        position: relative;
        padding-bottom: 1rem;
    }

    .date-display::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 25%;
        right: 25%;
        height: 1px;
        background: linear-gradient(90deg, 
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
        );
    }

    /* Enhance existing styles */
    .prayer-card {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 1.5rem;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        box-shadow: 
            0 4px 6px rgba(0, 0, 0, 0.1),
            0 10px 20px rgba(0, 0, 0, 0.1);
    }

    .prayer-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    }

    .prayer-card::after {
        content: '';
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        width: 1rem;
        height: 1rem;
        background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 1l7 4v6l-7 4-7-4V5l7-4z' fill='rgba(255,255,255,0.1)'/%3E%3C/svg%3E");
        background-size: contain;
        opacity: 0.5;
    }

    .prayer-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        border-color: rgba(255, 255, 255, 0.2);
    }

    .prayer-card.passed {
        opacity: 0.5;
        transform: scale(0.99);
    }

    .prayer-name {
        color: #9cb3c9;
        font-weight: 500;
        letter-spacing: 0.05em;
        position: relative;
        padding-left: 1.5rem;
    }

    .prayer-name::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 0.5rem;
        height: 0.5rem;
        background: currentColor;
        border-radius: 50%;
        opacity: 0.5;
    }

    .prayer-time {
        color: #ffffff;
        font-family: 'SF Mono', 'Monaco', monospace;
    }

    .clock-container {
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        position: relative;
    }

    .clock-container::after {
        content: '';
        position: absolute;
        bottom: -2rem;
        left: 50%;
        transform: translateX(-50%);
        width: 60%;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    }

    .next-prayer {
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid rgba(16, 185, 129, 0.2);
        border-radius: 0.75rem;
        position: relative;
        overflow: hidden;
    }

    .next-prayer::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(45deg, transparent, rgba(16, 185, 129, 0.1), transparent);
        animation: shine 2s infinite;
    }

    @keyframes shine {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
    }

    .iqamah-time {
        color: #10B981;
        font-size: 0.875em;
        letter-spacing: 0.025em;
        position: relative;
        padding-left: 1rem;
    }

    .iqamah-time::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 3px;
        background: currentColor;
        border-radius: 50%;
    }

    .ornament {
        position: absolute;
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 50%;
        pointer-events: none;
    }

    .ornament-1 {
        width: 400px;
        height: 400px;
        top: -200px;
        right: -200px;
    }

    .ornament-2 {
        width: 300px;
        height: 300px;
        bottom: -150px;
        left: -150px;
        border-width: 2px;
        opacity: 0.5;
    }

    .ornament-3 {
        width: 200px;
        height: 200px;
        top: 20%;
        right: 10%;
        border-style: dashed;
    }

    .footer {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        text-align: center;
        padding: 1rem;
        font-family: 'Amiri', serif;
        font-size: 1.5rem;
        color: rgba(255, 255, 255, 0.7);
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        background: linear-gradient(to top, rgba(0, 0, 0, 0.2), transparent);
        z-index: 10;
    }

    .images-container {
        position: absolute;
        inset: 0;
        z-index: 0;
        opacity: 0.1;
    }

    .theme-image {
        position: absolute;
        object-fit: cover;
        opacity: 0;
        transition: opacity 2s ease-in-out;
        animation: fadeInOut 20s infinite;
    }

    .theme-image:nth-child(2) { animation-delay: 5s; }
    .theme-image:nth-child(3) { animation-delay: 10s; }
    .theme-image:nth-child(4) { animation-delay: 15s; }

    @keyframes fadeInOut {
        0%, 100% { opacity: 0; }
        25%, 75% { opacity: 0.3; }
        50% { opacity: 0.5; }
    }

    @media (orientation: landscape) {
        .layout-container {
            flex-direction: row;
            gap: 8rem;
            padding: 4rem;
        }
        
        .clock-time {
            font-size: 20vh;
        }

        .prayer-list {
            max-width: 600px;
        }

        .theme-image {
            width: 100%;
            height: 100%;
        }
    }

    @media (orientation: portrait) {
        .layout-container {
            flex-direction: column;
            padding: 4rem 2rem;
            gap: 4rem;
        }

        .clock-time {
            font-size: 20vw;
        }

        .prayer-list {
            width: 100%;
            max-width: 600px;
        }

        .theme-image {
            width: 100%;
            height: 100%;
        }
    }

    .minaret {
        position: absolute;
        width: 4px;
        height: 40vh;
        background: linear-gradient(to bottom, 
            rgba(255, 255, 255, 0.1), 
            rgba(255, 255, 255, 0.05) 70%,
            transparent
        );
    }

    .minaret-left {
        left: 10%;
        top: 0;
    }

    .minaret-right {
        right: 10%;
        top: 0;
    }

    .minaret::after {
        content: '';
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
    }

    .arch {
        position: absolute;
        width: 60vw;
        height: 30vh;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        border-radius: 0 0 100% 100%;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-top: none;
    }

    @media (orientation: landscape) {
        .layout-container {
            flex-direction: row;
            gap: 8rem;
            padding: 4rem;
        }
        
        .clock-time {
            font-size: 20vh;
        }

        .prayer-list {
            max-width: 600px;
        }
    }

    @media (orientation: portrait) {
        .layout-container {
            flex-direction: column;
            padding: 4rem 2rem;
            gap: 4rem;
        }

        .clock-time {
            font-size: 20vw;
        }

        .prayer-list {
            width: 100%;
            max-width: 600px;
        }
    }
</style>

<main class="min-h-screen flex items-center justify-center mosque-bg text-white relative overflow-hidden">
    <div class="dome"></div>
    <div class="minaret minaret-left"></div>
    <div class="minaret minaret-right"></div>
    <div class="arch"></div>
    <div class="ornament ornament-1"></div>
    <div class="ornament ornament-2"></div>
    <div class="ornament ornament-3"></div>
    
    <!-- Background Images -->
    {#if data.apiData.custom_settings['name-file']}
        <div class="images-container">
            {#each data.apiData.custom_settings['name-file'] as image}
                <img src={image.path} alt="" class="theme-image" />
            {/each}
        </div>
    {/if}

    <div class="layout-container flex items-center justify-center w-full z-10">
        <!-- Clock and Date Section -->
        <header class="clock-container">
            <div class="clock-wrapper">
                <Time 
                    live={1_000} 
                    format={"HH:mm:ss"} 
                    class="clock-time leading-none mb-4" 
                />
                <div class="date-display">
                    <Time 
                        format={"dddd"} 
                        class="text-4xl landscape:text-5xl font-medium text-emerald-200/90 capitalize tracking-wide block" 
                    />
                    <Time 
                        format={"YYYY-MM-DD"} 
                        class="text-2xl landscape:text-3xl font-light text-sky-200/70 tracking-widest block mt-2" 
                    />
                </div>
            </div>
            
            {#if nextPrayerTime}
                <div class="next-prayer mt-8 p-6 relative">
                    <div class="absolute -top-3 -right-3 w-6 h-6">
                        <div class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-20"></div>
                        <div class="relative inline-flex rounded-full h-6 w-6 bg-emerald-500/20"></div>
                    </div>
                    <div class="text-emerald-300 font-medium mb-2 uppercase tracking-wider text-sm">
                        {data.apiData.language.next}
                    </div>
                    <div class="text-3xl font-bold text-white tracking-wide">
                        {nextPrayerTime.name} - {nextPrayerTime.time_readable}
                    </div>
                    {#if countdownToText}
                        <div class="text-xl text-sky-200/80 mt-2 font-mono tracking-tight">
                            {countdownToText}
                        </div>
                    {/if}
                </div>
            {/if}
        </header>

        <!-- Prayer Times List -->
        <div class="prayer-list space-y-6">
            {#each ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as prayer}
                {@const prayerData = calculator?.prayerTimes.find(p => p.id === prayer)}
                {#if prayerData}
                    <div class="prayer-card p-6 relative overflow-hidden" class:passed={calculator?.prayerHasPassed(prayerData)}>
                        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
                        <div class="flex justify-between items-start">
                            <div class="prayer-name text-xl landscape:text-2xl">
                                {prayerData.name}
                            </div>
                            <div class="flex flex-col items-end">
                                <div class="prayer-time text-2xl landscape:text-3xl font-semibold">
                                    {prayerData.time_readable}
                                </div>
                                {#if prayerData.showIqamah && prayerData.iqamah_readable}
                                    <div class="iqamah-time mt-2">
                                        {data.apiData.language.iqamah}: {prayerData.iqamah_readable}
                                    </div>
                                {/if}
                            </div>
                        </div>
                    </div>
                {/if}
            {/each}
        </div>
    </div>

    <!-- Footer with Arabic text -->
    {#if data.apiData.custom_settings.footer_text}
        <div class="footer" dir="rtl">
            {data.apiData.custom_settings.footer_text}
        </div>
    {/if}
</main>
