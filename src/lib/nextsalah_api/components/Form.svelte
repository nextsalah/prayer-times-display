<script lang="ts">
    import type { IFormData, IFormHandlerProps, ApiResponse, ILocation, IErrorResponse } from "$lib/nextsalah_api/interfaces";
    import FormHandler from "./FormHandler.svelte";
    import { onMount } from "svelte";
    import NextSalahAPI from "../handler";
    import { fade, slide } from 'svelte/transition';
    import { ExternalLink, CheckCircle } from 'lucide-svelte';
    import toast from 'svelte-french-toast';

    interface Props {
        FormData: IFormData;
        children?: import('svelte').Snippet;
    }

    let { FormData, children }: Props = $props();
    let FormHandlerProps: IFormHandlerProps = $state({
        fetchFinished: false,
        error: "",
        success: false
    });
    let isSuccess = $state(false);
    let formSubmitted = $state(false);
    
    onMount(async () => {
        try {
            const response = await new NextSalahAPI(FormData.end_point).get_all_locations();
            
            if (response.error) {
                FormHandlerProps.fetchFinished = true;
                FormHandlerProps.error = response.error.message;
            } else if (response.data) {
                FormData.handleData(response.data);
                isSuccess = true;
            }
        } finally {
            FormHandlerProps.fetchFinished = true;
        }
    });
    
    // Function to handle form submission success
    function handleFormSuccess() {
        formSubmitted = true;
        setTimeout(() => { formSubmitted = false; }, 3000); // Hide after 3 seconds
    }
</script>

<div class="flex flex-wrap gap-4 justify-center" in:fade={{ duration: 200 }}>
    <div class="card w-96 bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
        <!-- Loading State -->
        {#if !FormHandlerProps.fetchFinished}
            <div class="card-body items-center text-center p-6 min-h-[400px] flex justify-center">
                <div class="flex flex-col items-center gap-4">
                    <div class="loading loading-spinner loading-lg text-primary"></div>
                    <p class="text-base-content/60">Loading {FormData.source_name}...</p>
                </div>
            </div>
        
        <!-- Error State -->
        {:else if FormHandlerProps.error}
            <div class="card-body items-center text-center p-6 min-h-[400px] flex justify-center">
                <div class="flex flex-col items-center gap-4">
                    <div class="text-error">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div class="text-center">
                        <h3 class="font-bold text-lg text-error mb-2">Connection Error</h3>
                        <p class="text-base-content/60">{FormHandlerProps.error}</p>
                    </div>
                    <button 
                        class="btn btn-error btn-sm gap-2" 
                        onclick={() => window.location.reload()}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Try Again
                    </button>
                </div>
            </div>

        <!-- Success State -->
        {:else}
            <div class="card-body items-center text-center p-6 min-h-[400px]">
                <!-- Form Success Message -->
                {#if formSubmitted}
                    <div class="alert alert-success mb-4 w-full" transition:fade={{ duration: 300 }}>
                        <CheckCircle size={18} />
                        <span>Prayertime saved successfully!</span>
                    </div>
                {/if}
                
                {#if FormData.source_logo_src}
                    <div class="avatar mb-4" in:slide={{ duration: 200 }}>
                        <div class="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                            <img 
                                src={FormData.source_logo_src} 
                                alt="{FormData.source_name} logo"
                                class="mask mask-circle"
                            />
                        </div>
                    </div>
                {/if}

                <div class="space-y-3" in:slide={{ duration: 200, delay: 100 }}>
                    <h2 class="card-title text-xl text-base-content justify-center">
                        {FormData.source_name}
                    </h2>
                    
                    {#if FormData.source_link}
                        <a 
                            href={FormData.source_link} 
                            target="_blank" 
                            rel="noreferrer" 
                            class="link link-primary inline-flex items-center gap-1 text-sm hover:gap-2 transition-all"
                        >
                            Visit Source
                            <ExternalLink size={16} />
                        </a>
                    {/if}

                    {#if isSuccess}
                        <div class="badge badge-success gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                            </svg>
                            Connected
                        </div>
                    {/if}
                </div>

                <div class="divider"></div>

                <div class="w-full" in:slide={{ duration: 200, delay: 200 }}>
                    <FormHandler 
                        FormHandlerProps={FormHandlerProps} 
                        onSuccess={() => {
                            formSubmitted = true;
                            toast.success("Settings saved!", {
                                position: "bottom-center"
                            });
                            setTimeout(() => { formSubmitted = false; }, 3000);
                        }}
                    >
                        <input type="hidden" name="source" value={FormData.end_point} />
                        {@render children?.()}
                    </FormHandler>
                </div>
            </div>
        {/if}
    </div>
</div>