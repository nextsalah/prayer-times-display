<script>
    import 'tailwindcss/tailwind.css';   // Import Tailwind CSS
</script>
    
<slot />

<style>
     /* Reset the default browser styles*/
    :global( body) {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
</style>