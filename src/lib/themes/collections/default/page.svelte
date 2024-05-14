<script lang="ts">
	import Time from "$lib/themes/components/Time.svelte";
	import type { ScreenPageServerLoad } from "$lib/themes/constants/types";
	export let data: ScreenPageServerLoad;
</script>


<main>
	<header class="w-screen flex flex-col justify-center items-center space-y-0">
		<Time live={1_000} format={"HH:mm:ss"} />
		<Time format={"YYYY-mm-dddd"} />
	</header>
	<p> Date: { data.prayerTimes[0].date }</p>
	<p> { data.prayerTimes[0].fajr}</p>
	<p> { data.prayerTimes[0].dhuhr}</p>
	<p> { data.prayerTimes[0].asr}</p>
	<p> { data.prayerTimes[0].maghrib}</p>
	<p> { data.prayerTimes[0].isha}</p>

</main>