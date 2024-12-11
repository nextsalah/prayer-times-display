<script lang="ts">
    import { Motion } from "svelte-motion";
    import { navigation } from '$lib/config/navigation';
    import { ChevronRight } from "lucide-svelte";
</script>

<div class="p-4 max-w-lg mx-auto">
    <div class="space-y-3">
        {#each navigation.items as section}
            <Motion 
                 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
            >
                {#snippet children({ motion })}
                                <a
                        href="/{section.slug}"
                        class="card bg-base-300  shadow-sm hover:bg-base-300 transition-colors  border border-accent rounded-lg
                        "
                        use:motion
                    >
                        <div class="card-body p-4 flex-row items-center justify-between">
                            <div class="flex items-center gap-4">
                                <div class="{section.color} text-base-200 p-2 rounded-lg">
                                    <section.icon size={24} />
                                </div>
                                <div class="text-left">
                                    <div class="font-medium text-base-content">{section.title}</div>
                                    <div class="text-sm text-base-content/60">{section.description}</div>
                                </div>
                            </div>
                            <ChevronRight class="text-base-content/40" />
                        </div>
                    </a>
                                            {/snippet}
                        </Motion>
        {/each}
    </div>
</div>