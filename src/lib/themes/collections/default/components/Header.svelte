<script lang="ts">
    import Time from "$lib/themes/components/Time.svelte";
    let { 
        timezone = "Europe/Stockholm",
        use24h = true,
        showSeconds = true,
        dateFormat = "dddd, MMMM D YYYY",
        languageCode = "en",
        isDefaultTheme = true
    } = $props();
</script>

<header class={isDefaultTheme ? 'default-header ' : 'bg-base-100'}>
    <!-- Main Clock -->
    <p class={isDefaultTheme ? 'default-text clock-display' : 'clock-display'}>
        <Time 
            mode="time" 
            as="span"
            timezone={timezone} 
            use24h={use24h} 
            showSeconds={showSeconds}
        />
    </p>
    
    <!-- Date Display -->
    <p class="date-display" class:custom-text={isDefaultTheme} class:text-base-content={!isDefaultTheme}>
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

    .default-header {
        background-color: #f0f0f0;
    }

    .default-text {
        color: rgb(46, 46, 46);
        font-family: Arial, Helvetica, sans-serif;
        font-weight: bold;
    }

    .clock-display, .date-display {
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