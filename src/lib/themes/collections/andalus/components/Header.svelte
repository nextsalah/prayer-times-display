<script lang="ts">
    import Time from "$lib/themes/components/Time.svelte";
    let { 
        timezone = "Europe/Stockholm",
        use24h = true,
        showSeconds = true,
        dateFormat = "dddd, MMMM D YYYY",
        languageCode = "en"
    } = $props();
</script>

<header class='bg-gradient-to-b from-base-300 to-base-100 shadow-md'>
    <!-- Main Clock -->
    <p class='clock-display text-base-content font-extrabold'>
        <Time 
            mode="time" 
            as="span"
            timezone={timezone} 
            use24h={use24h} 
            showSeconds={showSeconds}
        />
    </p>
    
    <!-- Date Display -->
    <p class='date-display text-base-content/80 font-semibold'>
        <Time 
            mode="date" 
            as="span"
            format={dateFormat}
            locale={languageCode}
        />
    </p>
</header>

<style lang="scss">
    header {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .clock-display, .date-display {
        font-weight: bold;
        text-align: center;
        display: block;
        width: 100%;
        margin: 0;
        padding: 0;
    }

    .clock-display {
        line-height: 90%;
        font-size: 22.5vw;
        padding-top: 4%;
    }

    .date-display {
        font-size: 7.5vw;
        padding-bottom: 1%;
    }

    /* Media query for landscape orientation */
    @media (orientation: landscape) {
        .clock-display {
            font-size: 19vh !important; 
            padding-top: 2% !important;
        }

        .date-display {
            font-size: 6vh !important;
        }
    }
</style>