<script lang="ts">
    import { Motion } from "svelte-motion";
    import { navigation } from '$lib/config/navigation';
</script>

<div class="container mx-auto p-6">
    <div class="grid grid-cols-1 gap-6 justify-items-center sm:grid-cols-2 lg:grid-cols-3">
        {#each navigation.items as item}
        <Motion let:motion whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <a href="/{item.slug}" class="card bg-base-100 shadow-xl rounded-xl border-2 border-base-content hover:shadow-2xl transition-all duration-300 w-full max-w-sm " use:motion>
                <figure class="px-10 pt-10">
                    <div class="bg-white p-4 rounded-full shadow-md ring-1 ring-base-300">
                        <img src={item.icon} alt={item.title} class="h-12 w-12">
                    </div>
                </figure>
                <div class="card-body items-center text-center">
                    <h1 class="card-title text-2xl mb-2 font-semibold">{item.title}</h1>
                    <p class="text-muted">{item.description}</p>
                </div>
            </a>
        </Motion>
        {/each}
    </div>
</div>