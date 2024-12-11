<script lang="ts">
    import 'tailwindcss/tailwind.css';
    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();   // Import Tailwind CSS
</script>
    
{@render children?.()}

<style>
     /* Reset the default browser styles*/
    :global( body) {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
</style>