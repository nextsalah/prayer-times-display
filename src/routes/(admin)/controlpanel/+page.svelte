<script lang="ts">
    import { Motion } from "svelte-motion";
    import { navigation } from '$lib/config/navigation';
</script>
  
<div class="container mx-auto p-6">
    <div class="grid grid-cols-1 gap-6 justify-items-center sm:grid-cols-2 lg:grid-cols-3">
        {#each navigation.items as item}
        <Motion let:motion whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <a href="/{item.slug}" class="card bg-base-100 shadow-xl w-full max-w-sm" use:motion>
            <figure class="px-10 pt-10">
                <img src={item.icon} alt={item.title} class="h-16 w-16 mb-4 rounded-full">
            </figure>
            <div class="card-body items-center text-center">
                <h2 class="card-title text-2xl mb-2">{item.title}</h2>
                <p class="text-gray-600">{item.description}</p>
            </div>
            </a>
        </Motion>
            {/each}
    </div>
</div>

