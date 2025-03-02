<script lang="ts">
    import { page } from '$app/state';
</script>

<div class="p-4">
    {#if page.params.prayer}
        <h3 class="text-xl font-semibold mb-4">
            {page.params.prayer.charAt(0).toUpperCase() + page.params.prayer.slice(1)} Settings
        </h3>
        <!-- Add your prayer-specific configuration form here -->
    {:else}
        <div class="alert">
            <span>Please select a prayer time to configure</span>
        </div>
    {/if}
</div>