<script lang="ts">
    import dayjs from "dayjs";
    import type { PluginFunc } from "dayjs";
    
    // Import required plugins
    import relativeTime from "dayjs/plugin/relativeTime";
    import timezone from "dayjs/plugin/timezone";
    import utc from "dayjs/plugin/utc";
    import localizedFormat from "dayjs/plugin/localizedFormat";
    import advancedFormat from "dayjs/plugin/advancedFormat";
    import { localeImports } from "$lib/config/languageConfiguration";
    import { effect as formEffect } from "sveltekit-superforms/adapters";
    
    // Extend Day.js plugins
    dayjs.extend(relativeTime as PluginFunc);
    dayjs.extend(timezone as PluginFunc);
    dayjs.extend(utc as PluginFunc);
    dayjs.extend(localizedFormat as PluginFunc);
    dayjs.extend(advancedFormat as PluginFunc);
    
    // Define props for Svelte 5
    const props = $props<{
        mode?: 'date' | 'time' | 'datetime' | 'relative';
        format?: string | null;
        timestamp?: string | null;
        live?: boolean;
        updateInterval?: number;
        locale?: string;
        timezone?: string;
        capitalize?: boolean;
        as?: 'time' | 'span' | 'div';
        class?: string;
        use24h?: boolean;
        showSeconds?: boolean;
    }>();
    
    // Initial values from props
    const initialMode = props.mode ?? 'datetime';
    const initialFormat = props.format ?? null;
    const initialTimestamp = props.timestamp ?? null;
    const initialLive = props.live ?? true;
    const initialUpdateInterval = props.updateInterval ?? 1000;
    const initialLocale = props.locale;
    const initialTimezone = props.timezone ?? '';
    const initialCapitalize = props.capitalize ?? true;
    const initialAs = props.as ?? 'time';
    const initialClass = props.class ?? '';
    const initialUse24h = props.use24h ?? true;
    const initialShowSeconds = props.showSeconds ?? true;
    
    // State variables
    let mode = $state(initialMode);
    let format = $state(initialFormat);
    let timestamp = $state(initialTimestamp);
    let live = $state(initialLive);
    let updateInterval = $state(initialUpdateInterval);
    let locale = $state(initialLocale);
    let timezone_prop = $state(initialTimezone);
    let capitalize = $state(initialCapitalize);
    let as = $state(initialAs);
    let className = $state(initialClass);
    let use24h = $state(initialUse24h);
    let showSeconds = $state(initialShowSeconds);
    
    // Internal state
    let currentTime = $state(initialTimestamp ? new Date(initialTimestamp) : new Date());
    let formattedOutput = $state('');
    let interval: ReturnType<typeof setInterval> | undefined = undefined;
    
    // Locale loader function using the mapping
    async function loadLocale(locale: string): Promise<void> {
        const importLocale = localeImports[locale];
        if (importLocale) {
            try {
                await importLocale();
                dayjs.locale(locale);
                formatOutput(); // Update output after changing locale
            } catch (error) {
                console.warn(`Failed to load locale ${locale}:`, error);
                formatOutput();
            }
        } else {
            console.warn(`Locale ${locale} is not supported.`);
            formatOutput();
        }
    }
    
    // Single reactive effect for locale changes
    $effect(() => {
        if (locale) {
            loadLocale(locale);
        }
    });
    
    // Watch for other prop changes
    $effect(() => {
        let changed = false;
        
        if (props.mode !== undefined && props.mode !== mode) {
            mode = props.mode;
            changed = true;
        }
        if (props.format !== undefined && props.format !== format) {
            format = props.format;
            changed = true;
        }
        if (props.live !== undefined && props.live !== live) {
            live = props.live;
            setupInterval();
        }
        if (props.updateInterval !== undefined && props.updateInterval !== updateInterval) {
            updateInterval = props.updateInterval;
            if (live) setupInterval();
        }
        if (props.timezone !== undefined && props.timezone !== timezone_prop) {
            timezone_prop = props.timezone;
            changed = true;
        }
        if (props.capitalize !== undefined && props.capitalize !== capitalize) {
            capitalize = props.capitalize;
            changed = true;
        }
        if (props.as !== undefined && props.as !== as) {
            as = props.as;
        }
        if (props.class !== undefined && props.class !== className) {
            className = props.class;
        }
        if (props.use24h !== undefined && props.use24h !== use24h) {
            use24h = props.use24h;
            changed = true;
        }
        if (props.showSeconds !== undefined && props.showSeconds !== showSeconds) {
            showSeconds = props.showSeconds;
            changed = true;
        }
        
        // Handle timestamp changes
        if (props.timestamp !== undefined && props.timestamp !== timestamp) {
            timestamp = props.timestamp;
            if (timestamp) {
                currentTime = new Date(timestamp);
            }
            setupInterval();
        }
        
        // Handle locale changes from props by updating our state.
        if (props.locale !== undefined && props.locale !== locale) {
            locale = props.locale;
        }
        
        // If any other format-affecting prop changed, update the output.
        if (changed) {
            formatOutput();
        }
    });
    
    // React to changes in currentTime
    $effect(() => {
        formatOutput();
    });
    
    // Setup interval effect
    function setupInterval() {
        if (interval) {
            clearInterval(interval);
            interval = undefined;
        }
        
        if (live && !timestamp) {
            interval = setInterval(() => {
                currentTime = new Date();
            }, updateInterval);
        }
    }
    
    // Initial interval setup
    setupInterval();
    
    // Get default format based on mode, 24h preference, and seconds preference
    function getDefaultFormat(formatMode: 'date' | 'time' | 'datetime' | 'relative'): string {
        const timeFormat = use24h 
            ? (showSeconds ? 'HH:mm:ss' : 'HH:mm')
            : (showSeconds ? 'hh:mm:ss A' : 'hh:mm A');
            
        switch (formatMode) {
            case 'date':
                return 'YYYY-MM-DD';
            case 'time':
                return timeFormat;
            case 'datetime':
                return `YYYY-MM-DD ${timeFormat}`;
            case 'relative':
                return `YYYY-MM-DD ${timeFormat}`;
            default:
                return `YYYY-MM-DD ${timeFormat}`;
        }
    }
    
    // Actual formatting function
    function formatOutput() {
        try {
            let dayjsObj = dayjs(currentTime);
            
            if (timezone_prop) {
                dayjsObj = dayjsObj.tz(timezone_prop);
            }
            
            const actualFormat = format || getDefaultFormat(mode);
            let result = mode === 'relative' ? dayjsObj.fromNow() : dayjsObj.format(actualFormat);
            
            if (capitalize && result.length > 0) {
                result = result.charAt(0).toUpperCase() + result.slice(1);
            }
            
            formattedOutput = result;
        } catch (error) {
            console.error('Error formatting time:', error);
            formattedOutput = 'Invalid date';
        }
    }
    
    // Cleanup on component destroy
    $effect.root(() => {
        return () => {
            if (interval) {
                clearInterval(interval);
                interval = undefined;
            }
        };
    });
    
    // Tooltip for relative time mode
    function getTooltipTitle() {
        if (mode === 'relative') {
            try {
                let dayjsObj = dayjs(currentTime);
                if (timezone_prop) {
                    dayjsObj = dayjsObj.tz(timezone_prop);
                }
                return dayjsObj.format(getDefaultFormat('datetime'));
            } catch (error) {
                return undefined;
            }
        }
        return undefined;
    }
</script>
  
{#if as === 'time'}
    <time datetime={currentTime.toISOString()} title={getTooltipTitle()} class={className}>
        {formattedOutput}
    </time>
{:else if as === 'span'}
    <span title={getTooltipTitle()} class={className}>
        {formattedOutput}
    </span>
{:else}
    <div title={getTooltipTitle()} class={className}>
        {formattedOutput}
    </div>
{/if}
