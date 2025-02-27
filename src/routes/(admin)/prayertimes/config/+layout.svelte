<script lang="ts">
    import { page } from '$app/state';
    const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    let props = $props();
</script>

<div class="w-full">
    <h2 class="text-2xl font-bold mb-4">Prayer Times Configuration</h2>
    
    <div class="tabs tabs-boxed">
        {#each prayers as prayer}
            <a 
                href="/prayertimes/config/{prayer}"
                class="tab {page.params.prayer === prayer ? 'tab-active' : ''}"
            >
                {prayer.charAt(0).toUpperCase() + prayer.slice(1)}
            </a>
        {/each}
    </div>

    <div class="mt-4">
        {@render props.children()}
    </div>
</div>