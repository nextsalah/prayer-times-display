<script lang="ts">
	interface Props {
		data: any;
	}

	let { data }: Props = $props();
</script>


<p>Fajr {data.data.fajr}</p>
<p>Dhuhr {data.data.dhuhr}</p>
<p>Asr {data.data.asr}</p>
<p>Maghrib {data.data.maghrib}</p>
<p>Isha {data.data.isha}</p>
