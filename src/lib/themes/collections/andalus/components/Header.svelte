<script lang="ts">
    import Time from "$lib/themes/components/Time.svelte";
    import { onMount } from 'svelte';
    
    let {
        showSeconds = true
    } = $props();
    
    let hours = $state('00');
    let minutes = $state('00');
    let seconds = $state('00');
    let islamicDate = $state('');
    let gregorianDate = $state('');
    
    function updateTime() {
        const now = new Date();
        hours = String(now.getHours()).padStart(2, '0');
        minutes = String(now.getMinutes()).padStart(2, '0');
        seconds = String(now.getSeconds()).padStart(2, '0');
        
        // Format Islamic date in Arabic
        try {
            const islamicFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
                month: 'long',
                day: 'numeric',
                numberingSystem: 'arab'
            });
            islamicDate = islamicFormatter.format(now);
        } catch (e) {
            islamicDate = '';
        }
        
        // Format Gregorian date in Swedish
        try {
            const gregorianFormatter = new Intl.DateTimeFormat('sv-SE', {
                weekday: 'long',
                month: 'short',
                day: 'numeric'
            });
            gregorianDate = gregorianFormatter.format(now);
        } catch (e) {
            gregorianDate = '';
        }
    }
    
    onMount(() => {
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    });
</script>

<header>
    <!-- Date Display at top -->
    <div class='date-row'>
        <p class='date-islamic'>
            {islamicDate}
        </p>
        <p class='date-gregorian'>
            {gregorianDate}
        </p>
    </div>
    
    <!-- Clock Display with rounded boxes -->
    <div class='clock-container'>
        <!-- Hours -->
        <div class='time-box'>
            <span class='time-digits'>{hours}</span>
        </div>
        
        <!-- Separator -->
        <span class='separator'>:</span>
        
        <!-- Minutes -->
        <div class='time-box'>
            <span class='time-digits'>{minutes}</span>
        </div>
        
        <!-- Seconds (smaller) -->
        {#if showSeconds}
            <span class='seconds'>{seconds}</span>
        {/if}
    </div>
</header>

<style lang="scss">
    header {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: transparent;
        position: relative;
        padding: 0;
        transform: translateX(3vw);
    }
    
    /* Date row at the top */
    .date-row {
        display: flex;
        gap: 4vw;
        justify-content: center;
        align-items: center;
        width: 100%;
        position: relative;
        margin-bottom: 1vw;
        transform: translateX(-3vw);
        
        p {
            margin: 0;
            font-size: 3.5vw;
            font-weight: 400;
            color: white;
            font-family: 'Barlow Condensed', 'Segoe UI', sans-serif;
            letter-spacing: 0;
            line-height: normal;
        }
    }
    
    .date-islamic {
        text-align: right;
    }
    
    .date-gregorian {
        text-align: left;
    }

    /* Clock container with boxes */
    .clock-container {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1.5vw;
        position: relative;
    }
    
    /* Time boxes with rounded corners and glass effect */
    .time-box {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2.5vw;
        width: 22vw;
        height: 27vw;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.15);
        box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }
    
    .time-digits {
        font-size: 28vw;
        font-weight: 400;
        color: white;
        line-height: 1;
        font-family: 'Big Shoulders Display', 'Impact', sans-serif;
        letter-spacing: 0;
        font-variant-numeric: tabular-nums;
        font-feature-settings: "tnum";
    }
    
    /* Separator colon */
    .separator {
        font-size: 28vw;
        font-weight: 400;
        color: white;
        line-height: 1;
        font-family: 'Big Shoulders Display', 'Impact', sans-serif;
        margin: 0;
        align-self: flex-start;
    }
    
    /* Seconds display */
    .seconds {
        font-size: 13vw;
        font-weight: 400;
        color: white;
        line-height: 1;
        font-family: 'Big Shoulders Display', 'Impact', sans-serif;
        align-self: flex-end;
        margin-left: 1vw;
        padding-bottom: 1.5vw;
        font-variant-numeric: tabular-nums;
        font-feature-settings: "tnum";
        width: 12vw;
        text-align: center;
        flex-shrink: 0;
    }

    /* Media query for landscape orientation */
    @media (orientation: landscape) {
        header {
            padding: 0;
            transform: translateX(2vh);
        }
        
        .date-row {
            gap: 4vh;
            margin-bottom: 1vh;
            transform: translateX(-2vh);

            p {
                font-size: 3.5vh;
            }
        }
        
        .clock-container {
            gap: 1.2vh;
        }
        
        .time-box {
            border-radius: 2vh;
            width: 18vh;
            height: 22vh;
            border: 1px solid rgba(255, 255, 255, 0.15);
            box-shadow:
                0 8px 32px rgba(0, 0, 0, 0.25),
                inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }
        
        .time-digits {
            font-size: 22vh;
            font-variant-numeric: tabular-nums;
            font-feature-settings: "tnum";
        }
        
        .separator {
            font-size: 22vh;
            margin: 0;
        }
        
        .seconds {
            font-size: 11vh;
            margin-left: 1vh;
            padding-bottom: 1.5vh;
            font-variant-numeric: tabular-nums;
            font-feature-settings: "tnum";
            width: 8vh;
            text-align: center;
            flex-shrink: 0;
        }
    }
</style>