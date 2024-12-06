<script lang="ts">
    import { Motion } from "svelte-motion";
    import { Card } from "flowbite-svelte";
    import type { PageData } from './$types';
    import { navigation } from '$lib/config/navigation';

</script>
  
<div class="container mx-auto p-6">
<h1 class="text-4xl font-bold mb-8 text-center">Control Panel</h1>

<div class="grid grid-cols-1 gap-6 justify-items-center sm:grid-cols-2 lg:grid-cols-3">
    {#each navigation.items as item}
    <Motion let:motion whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Card href="/{item.slug}" class="flex flex-col items-center text-center w-full max-w-sm p-6" use={motion}>
        <img src={item.icon} alt={item.title} class="h-16 w-16 mb-4">
        <h2 class="text-2xl font-semibold mb-2">{item.title}</h2>
        <p class="text-gray-600">{item.description}</p>
        </Card>
    </Motion>
    {/each}
</div>
</div>

