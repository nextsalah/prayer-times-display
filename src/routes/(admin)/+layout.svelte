<script>
  import 'tailwindcss/tailwind.css';   // Import Tailwind CSS
  import HeadWrapper from '$lib/components/HeadWrapper.svelte';
  import BottomNavigation from '$lib/components/general/BottomNavigation.svelte';
  import { page } from '$app/stores';  

</script>
  
<HeadWrapper page_title={ $page.data.title || "" } />
<slot />
<BottomNavigation />