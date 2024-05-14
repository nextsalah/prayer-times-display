<script lang="ts">
	import Time from "$lib/themes/components/Time.svelte";
	import type { ScreenPageServerLoad } from "$lib/themes/constants/types";
	export let data: ScreenPageServerLoad;
  </script>
  
  <main class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
	<div class="container w-full h-full flex flex-col items-center justify-center">
	  <header class="time-container flex flex-col justify-center items-center">
		<Time live={1_000} format={"HH:mm:ss"} class="text-6xl font-bold" />
		<Time format={"YYYY-MM-DD"} class="text-xl font-bold" />
	  </header>
	  <ul class="prayer-times mt-4 space-y-2">
		<li class="flex justify-between text-xl font-bold bg-black bg-opacity-50 p-2 rounded-md">
		  <span class="text-teal-200">Fajr :</span>
		  <span>{data.prayerTimes.today.fajr}</span>
		</li>
		<li class="flex justify-between text-xl font-bold bg-black bg-opacity-50 p-2 rounded-md">
		  <span class="text-teal-200">Dhuhr :</span>
		  <span>{data.prayerTimes.today.dhuhr}</span>
		</li>
		<li class="flex justify-between text-xl font-bold bg-black bg-opacity-50 p-2 rounded-md">
		  <span class="text-teal-200">Asr :</span>
		  <span>{data.prayerTimes.today.asr}</span>
		</li>
		<li class="flex justify-between text-xl font-bold bg-black bg-opacity-50 p-2 rounded-md">
		  <span class="text-teal-200">Maghrib :</span>
		  <span>{data.prayerTimes.today.maghrib}</span>
		</li>
		<li class="flex justify-between text-xl font-bold bg-black bg-opacity-50 p-2 rounded-md">
		  <span class="text-teal-200">Isha :</span>
		  <span>{data.prayerTimes.today.isha}</span>
		</li>
	  </ul>
	</div>
  </main>
  
  <style lang="scss">
	main {
	  background: linear-gradient(to bottom right, #2c3e50, #4ca1af);
	  width: 100vw;
	  height: 100vh;
	  display: flex;
	  align-items: center;
	  justify-content: center;
	}
  
	.container {
	  background-color: rgba(51, 51, 51, 0.9);
	  width: 100vw;
	  height: 100vh;
	  display: flex;
	  flex-direction: column;
	  justify-content: center;
	  align-items: center;
	}
  
	.time-container {
	  text-align: center;
	}
  
	@media (orientation: portrait) {
	  :global(.time) {
		font-size: 5rem;
	  }
  
	  :global(.date) {
		font-size: 2rem;
	  }
  
	  .prayer-times {
		font-size: 1.5rem;
	  }
	}
  
	@media (orientation: landscape) {
	  .container {
		flex-direction: row;
		justify-content: space-around;
		align-items: center;
	  }
  
	  .time-container {
		flex: 1;
	  }
  
	  .prayer-times {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: space-around;
	  }
  
	  :global(.time) {
		font-size: 7rem;
	  }
  
	  :global(.date) {
		font-size: 3rem;
	  }
  
	  .prayer-times li {
		font-size: 2rem;
	  }
	}
</style>
  