<script lang="ts">
    import Time from "$themes/components/Time.svelte";
    import type { ScreenPageServerLoad } from "$themes/constants/types";
    interface Props {
        data: ScreenPageServerLoad;
    }

    let { data }: Props = $props();
</script>

<style>
    .gradient-bg {
        background-image: linear-gradient(to bottom right, #6a11cb, #2575fc);
    }
    .prayer-time {
        background-color: rgba(0, 0, 0, 0.5);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Added subtle shadow */
    }
    .prayer-time span {
        color: #fff;
    }
</style>

<main class="min-h-screen flex items-center justify-center gradient-bg text-white">
    <div class="container w-[100vw] h-[100vh] flex flex-col items-center justify-center portrait:space-y-4 landscape:flex-row landscape:space-x-12">
        <header class="flex flex-col items-center mb-5 landscape:space-y-0">
            <Time live={1_000} format={"HH:mm:ss"} class="clock text-[18vw] font-mono font-bold text-white landscape:text-[10vh] leading-none" />
            <Time format={"YYYY-MM-DD dddd"} class="date text-4xl font-sans font-bold text-light-blue-300 opacity-80 mt-0 landscape:mt-1 leading-none" />
        </header>
        <ul class="mt-6 w-[80vw] space-y-4 landscape:mt-0 landscape:max-w-none landscape:flex landscape:flex-col landscape:space-y-6">
            <li class="prayer-time flex justify-between text-3xl font-bold p-4 rounded-md landscape:text-2xl landscape:p-6">
                <span>Fajr :</span>
                <span>{data.prayerTimes.today.fajr}</span>
            </li>
            <li class="prayer-time flex justify-between text-3xl font-bold p-4 rounded-md landscape:text-2xl landscape:p-6">
                <span>Dhuhr :</span>
                <span>{data.prayerTimes.today.dhuhr}</span>
            </li>
            <li class="prayer-time flex justify-between text-3xl font-bold p-4 rounded-md landscape:text-2xl landscape:p-6">
                <span>Asr :</span>
                <span>{data.prayerTimes.today.asr}</span>
            </li>
            <li class="prayer-time flex justify-between text-3xl font-bold p-4 rounded-md landscape:text-2xl landscape:p-6">
                <span>Maghrib :</span>
                <span>{data.prayerTimes.today.maghrib}</span>
            </li>
            <li class="prayer-time flex justify-between text-3xl font-bold p-4 rounded-md landscape:text-2xl landscape:p-6">
                <span>Isha :</span>
                <span>{data.prayerTimes.today.isha}</span>
            </li>
        </ul>
    </div>
</main>
