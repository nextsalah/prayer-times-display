<script lang="ts">
    import dayjs from "dayjs";
    import type { PluginFunc } from "dayjs";
    
    // Import required plugins with proper typing
    import relativeTime from "dayjs/plugin/relativeTime";
    import timezone from "dayjs/plugin/timezone";
    import utc from "dayjs/plugin/utc";
    import localizedFormat from "dayjs/plugin/localizedFormat";
    import advancedFormat from "dayjs/plugin/advancedFormat";
    
    // Load all required plugins properly
    dayjs.extend(relativeTime as PluginFunc);
    dayjs.extend(timezone as PluginFunc);
    dayjs.extend(utc as PluginFunc);
    dayjs.extend(localizedFormat as PluginFunc);
    dayjs.extend(advancedFormat as PluginFunc);
    
    // Define props correctly for Svelte 5
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
        use24h?: boolean;        // New prop for 24h format
        showSeconds?: boolean;   // New prop for seconds display
    }>();
    
    // Create separate state variables with default values
    let mode = $state(props.mode ?? 'datetime');
    let format = $state(props.format ?? null);
    let timestamp = $state(props.timestamp ?? null);
    let live = $state(props.live ?? true);
    let updateInterval = $state(props.updateInterval ?? 1000);
    let locale = $state(props.locale ?? 'en');
    let timezone_prop = $state(props.timezone ?? '');
    let capitalize = $state(props.capitalize ?? true);
    let as = $state(props.as ?? 'time');
    let className = $state(props.class ?? '');
    let use24h = $state(props.use24h ?? true);          // Default to 24h format
    let showSeconds = $state(props.showSeconds ?? true); // Default to showing seconds
    
    // Internal state
    let currentTime = $state(new Date());
    let formattedOutput = $state('');
    let interval = $state<ReturnType<typeof setInterval> | undefined>(undefined);
    
    // Get default format based on mode, 24h preference, and seconds preference
    function getDefaultFormat(mode: 'date' | 'time' | 'datetime' | 'relative'): string {
        // Format for time portion based on 24h and seconds settings
        const timeFormat = use24h 
            ? (showSeconds ? 'HH:mm:ss' : 'HH:mm')
            : (showSeconds ? 'hh:mm:ss A' : 'hh:mm A');
            
        switch (mode) {
            case 'date':
                return 'YYYY-MM-DD';
            case 'time':
                return timeFormat;
            case 'datetime':
                return `YYYY-MM-DD ${timeFormat}`;
            case 'relative':
                return `YYYY-MM-DD ${timeFormat}`; // Used for tooltip
            default:
                return `YYYY-MM-DD ${timeFormat}`;
        }
    }
    
    // Watch for prop changes and update state
    $effect(() => {
        if (props.mode !== undefined) mode = props.mode;
        if (props.format !== undefined) format = props.format;
        if (props.timestamp !== undefined) timestamp = props.timestamp;
        if (props.live !== undefined) live = props.live;
        if (props.updateInterval !== undefined) updateInterval = props.updateInterval;
        if (props.locale !== undefined) locale = props.locale;
        if (props.timezone !== undefined) timezone_prop = props.timezone;
        if (props.capitalize !== undefined) capitalize = props.capitalize;
        if (props.as !== undefined) as = props.as;
        if (props.class !== undefined) className = props.class;
        if (props.use24h !== undefined) use24h = props.use24h;
        if (props.showSeconds !== undefined) showSeconds = props.showSeconds;
    });
    
    // Load locale when it changes
    $effect(() => {
        if (locale && locale !== 'en') {
            try {
                import(`dayjs/locale/${locale}.js`)
                    .then(() => {
                        dayjs.locale(locale);
                        updateFormattedOutput();
                    })
                    .catch(err => {
                        console.warn(`Failed to load locale ${locale}:`, err);
                        dayjs.locale('en');
                    });
            } catch (e) {
                console.warn(`Failed to load locale ${locale}`);
                dayjs.locale('en');
            }
        } else {
            dayjs.locale('en');
        }
    });
    
    // Setup live update interval
    $effect(() => {
        // Clean up existing interval
        if (interval) {
            clearInterval(interval);
            interval = undefined;
        }
        
        // If live mode and no specific timestamp is provided
        if (live && !timestamp) {
            // Initial update
            currentTime = new Date();
            updateFormattedOutput();
            
            // Setup interval for updates
            interval = setInterval(() => {
                currentTime = new Date();
                updateFormattedOutput();
            }, updateInterval);
        } else if (timestamp) {
            // Use the provided timestamp
            currentTime = new Date(timestamp);
            updateFormattedOutput();
        } else {
            // Just use current time as a snapshot
            currentTime = new Date();
            updateFormattedOutput();
        }
        
        // Clean up on component destroy
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    });
    
    // Update output when dependencies change
    $effect(() => {
        mode; format; locale; timezone_prop; capitalize; use24h; showSeconds;
        updateFormattedOutput();
    });
    
    // Actual formatting function
    function updateFormattedOutput() {
        let dayjsObj = dayjs(currentTime);
        
        // Apply timezone if specified
        if (timezone_prop) {
            dayjsObj = dayjsObj.tz(timezone_prop);
        }
        
        // Determine format to use based on mode, 24h, and seconds settings
        // If custom format is provided, use that instead
        const actualFormat = format || getDefaultFormat(mode);
        
        // Format based on mode
        let result = '';
        if (mode === 'relative') {
            result = dayjsObj.fromNow();
        } else {
            result = dayjsObj.format(actualFormat);
        }
        
        // Apply capitalization if enabled
        if (capitalize) {
            result = result.replace(/^\w/, c => c.toUpperCase());
        }
        
        formattedOutput = result;
    }
    
    // For tooltip when using relative time
    const tooltipTitle = $derived(
        mode === 'relative' 
            ? dayjs(currentTime).format(format || getDefaultFormat('datetime')) 
            : undefined
    );
</script>

{#if as === 'time'}
    <time datetime={currentTime.toISOString()} title={tooltipTitle} class={className}>
        {formattedOutput}
    </time>
{:else if as === 'span'}
    <span title={tooltipTitle} class={className}>
        {formattedOutput}
    </span>
{:else}
    <div title={tooltipTitle} class={className}>
        {formattedOutput}
    </div>
{/if}