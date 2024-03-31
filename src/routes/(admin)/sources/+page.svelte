<script lang="ts">
    import Vaktijaba from "$lib/nextsalah_api/sources/vaktijaba.svelte";
    import Vaktijaeu from "$lib/nextsalah_api/sources/vaktijaeu.svelte";
    import IslamiskaForbundet from "$lib/nextsalah_api/sources/islamiskaForbundet.svelte";

</script>


<div class="flex flex-wrap gap-5 justify-center sm:justify-start">
    <Vaktijaba />
    <Vaktijaeu />
    <IslamiskaForbundet />
</div>