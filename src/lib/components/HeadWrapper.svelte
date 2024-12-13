<script lang="ts">
	let { page_title = "" } : { page_title: string } = $props();
</script>

<svelte:head>
	<title>NextSalah - {page_title} </title>
	<!-- Character encoding -->
	<meta charset="utf-8" />
	
	<!-- Helps mobile devices properly scale the content -->
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	
	<!-- Basic description of the site's content -->
	<meta name="description" content="NextSalah: Accurate and timely prayer times for your masjid. Stay updated with the prayer schedule and never miss a prayer.">
	
	<!-- Favicons for different devices and platforms -->
	<meta name="msapplication-TileColor" content="#0ad115">
	<meta name="theme-color" content="#0ad115">

	<!-- Authorship, if you wish to specify -->
	<meta name="author" content="Ismail Sacic">
</svelte:head>