<script lang="ts">
    import toast from 'svelte-french-toast';

    import type { IFormHandlerProps } from '../interfaces';
    import { deserialize } from '$app/forms';

    interface Props {
        FormHandlerProps?: IFormHandlerProps;
        children?: import('svelte').Snippet;
        onSuccess?: () => void;
    }

    let { 
        FormHandlerProps = $bindable({
            fetchFinished: false,
            error: "",
        }), 
        children,
        onSuccess = () => {} 
    }: Props = $props();

    let isLoading: boolean = $state(false);

    const handleSubmit = async (form: HTMLFormElement) => {
        isLoading = true;

        try {
            const response = await send_form(form);
            if (response.type === "error" ) {
                FormHandlerProps.error = response.error.message || "Failed to send form.";
                toast.error(FormHandlerProps.error || "An error occurred");
                console.error(response.error);
            } else if (response.type === "failure") {
                FormHandlerProps.error = "Failed to send form.";
                toast.error(FormHandlerProps.error);
            }
            else {
                 FormHandlerProps.fetchFinished = true;
                FormHandlerProps.error = ""; // Clear any previous errors
                onSuccess(); // Call the onSuccess callback
                toast.success('Saved succssfuly')
            }
        } catch (e) {
            FormHandlerProps.error = "Failed to send form.";
            toast.error(FormHandlerProps.error, {
                position: "bottom-center"
            });
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
        onsubmit={(event) =>  {
            event.preventDefault();
            const form = event.target;
            if ( form instanceof HTMLFormElement ) {
                handleSubmit(form);
            }
        }} >
        {@render children?.()}
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