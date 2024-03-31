<script lang="ts">
    import type { IFormHandlerProps } from '../interfaces';
    import { deserialize } from '$app/forms';

    export let FormHandlerProps: IFormHandlerProps = {
        fetchFinished: false,
        error: "",
    };

    let isLoading: boolean = false;

    const handleSubmit = async (form: HTMLFormElement) => {
        isLoading = true;

        try {
            const response = await send_form(form);
            if (response.type === "error" ) {
                FormHandlerProps.error = response.error.message || "Failed to send form.";
                console.error(response.error);
            } else if (response.type === "failure") {
                FormHandlerProps.error = "Failed to send form.";
            }
            else {
                FormHandlerProps.fetchFinished = true;
            }
        } catch (e) {
            FormHandlerProps.error = "Failed to send form.";
        } finally {
            isLoading = false;
        }
    };

    const send_form = async (form: HTMLFormElement) => {
        const data = new FormData(form);
        const response = await fetch(form.action, {
            method: 'POST',
            body: data,
        });
        return deserialize(await response.text());
    };
</script>



{#if FormHandlerProps.fetchFinished && !FormHandlerProps.error}
    <form 
        method="POST"
        on:submit|preventDefault={ (event) =>  {
            const form = event.target;
            if ( form instanceof HTMLFormElement ) {
                handleSubmit(form);
            }
        } } >
        <slot />
        <div class="mt-5">
            {#if isLoading}
                <button class="btn btn-wide btn-accent">
                    <span class="loading loading-spinner"></span>
                    loading
                </button>
            {:else}
                <button class="btn btn-wide btn-accent" type="submit">Save</button>
            {/if}
        </div>
    </form>
{:else if FormHandlerProps.error}
    <div role="alert" class="alert alert-error">
        <span> {FormHandlerProps.error}</span>
    </div>
{:else}
    <div class="skeleton w-full h-12"></div>
{/if}


