<script lang="ts">
    import type { IFormData, IFormHandlerProps, ApiResponse, ILocation, IErrorResponse } from "$lib/nextsalah_api/interfaces";
    import FormHandler from "./FormHandler.svelte";
	import { onMount } from "svelte";
	import NextSalahAPI from "../handler";

    interface Props {
        FormData: IFormData;
        children?: import('svelte').Snippet;
    }

    let { FormData, children }: Props = $props();
    let FormHandlerProps: IFormHandlerProps = $state({});
    
    onMount(async () => {
        const response = await new NextSalahAPI(FormData.end_point).get_all_locations();
        // Test error handling
        // response.error = { message: "NOT WORKING", statusCode: 500}
        if (response.error) {
            FormHandlerProps.fetchFinished = true;
            FormHandlerProps.error = response.error.message;
        } else if (response.data) {
            FormData.handleData(response.data);
        }
        
        FormHandlerProps.fetchFinished = true;
    });
</script>

<div class="flex flex-col gap-2">
    <div class="card w-96 bg-base-100 shadow-xl">
        <figure class="px-10 pt-10">
            <img src={FormData.source_logo_src} alt="{FormData.source_name} logo" class="rounded-full w-20 h-20"/>
        </figure>
        <div class="card-body items-center text-center">
            <div class="flex-1 min-w-0">
                <p class="text-xl font-normal text-gray-900 truncate dark:text-white">
                    {FormData.source_name}
                </p>
                <p class="text-sm text-gray-500 truncate dark:text-gray-400">
                    <a href={FormData.source_link} target="_blank" rel="noreferrer" class="inline-flex items-center text-blue-400 hover:underline">
                        Link to source
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 ml-1"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                    </a>           
                </p>
            </div>
            <FormHandler {FormHandlerProps} >
                <input type="hidden" name="source" value={FormData.end_point} />
                {@render children?.()}
            </FormHandler>
        </div>
      </div>
</div> 

