<script lang="ts">

    import SingleOption from "../template/SingleOptionForm.svelte";
    import type { ISingleOptionProps} from "$lib/nextsalah_api/interfaces";

    import vaktijaba from "$lib/assets/imgs/vaktijaba.png";

    const SingleFormData: ISingleOptionProps = {
        source_name: "Vaktija.ba",
        source_logo_src: vaktijaba,
        source_link: "https://vaktija.ba/",
        end_point: "/vaktijaba",
        select_label: "Choose a city",
        selected_key: "location_id",
        option_by_index: true
    }

    
</script>

<SingleOption  {SingleFormData} />