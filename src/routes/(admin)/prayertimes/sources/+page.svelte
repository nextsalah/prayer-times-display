<script lang="ts">
    import Vaktijaba from "$lib/nextsalah_api/sources/vaktijaba.svelte";
    import Vaktijaeu from "$lib/nextsalah_api/sources/vaktijaeu.svelte";
    import IslamiskaForbundet from "$lib/nextsalah_api/sources/islamiskaForbundet.svelte";
</script>


<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
    <Vaktijaba />
    <Vaktijaeu />
    <IslamiskaForbundet />
</div>