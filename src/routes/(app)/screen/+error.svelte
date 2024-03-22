<script lang="ts">
    import { page } from '$app/stores';
</script>

<div class="error-container">
    <h2>Error {$page.status}</h2>
    <p>{$page.error?.message}</p>
</div>


<style lang="scss">
    .error-container {
        margin: 1rem 2rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        text-align: center;
        background-color: #ffeded; // light red background for error
        border: 1px solid #e0a7a7; // subtle border
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); // shadow for depth

        h2 {
            font-family: 'Poppins', sans-serif;
            font-weight: 700; // bold font for error status
            color: #d43f00; // dark red color for emphasis
            margin-bottom: 0.5rem; // spacing between the status and the message
            font-size:  2rem;
            text-transform: uppercase;
        }

        p {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 1.3rem; // slightly larger font for the error message
            color: #333; // dark color for readability
        }
    }
</style>