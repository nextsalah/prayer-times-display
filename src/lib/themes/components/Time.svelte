<script lang="ts">
    import dayjs from "dayjs";
    import relativeTime from "dayjs/plugin/relativeTime";
    import { onMount, onDestroy } from "svelte";
    import type { OptionType } from "dayjs";

    // Extend dayjs with the relativeTime plugin
    dayjs.extend(relativeTime);

    export let timestamp: string | null | undefined = new Date().toISOString();

    export let format: OptionType = "YYYY-MM-DD HH:mm:ss";

    export let relative: boolean = false;

    export let live: boolean | number = false;

    export let formatted: string = "";

    let interval: ReturnType<typeof setInterval> | undefined;

    const DEFAULT_INTERVAL = 60 * 1_000;

    onMount(() => {
        if (live !== false) {
            interval = setInterval(() => {
                timestamp = new Date().toISOString();
                formatted = getFormatted();
            }, typeof live === "number" ? live : DEFAULT_INTERVAL);
        }
        formatted = getFormatted();
    });

    onDestroy(() => {
        if (interval) {
            clearInterval(interval);
        }
    });

    const getFormatted = () => {
        return relative 
            ? dayjs(timestamp).fromNow().replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase())) 
            : dayjs(timestamp).format(format as string).replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));
    };

    $: formatted = getFormatted();
    $: title = relative ? dayjs(timestamp).format(format as string) : undefined;
</script>

<time {...$$restProps} {title} datetime={timestamp} class={$$props.class}>
  {formatted}
</time>
