<script lang="ts">

    import SingleOption from "../template/SingleOptionForm.svelte";
    import type { ISingleOptionProps} from "$lib/nextsalah_api/interfaces";
    import islamiska_forbundet from "$lib/assets/imgs/islamiska_forbundet.jpg";

    const SingleFormData: ISingleOptionProps = {
        source_name: "Islamiska Förbundet",
        source_logo_src: islamiska_forbundet,
        source_link: "https://www.islamiskaforbundet.se/",
        end_point: "/islamiska-forbundet",
        select_label: "Choose a city",
        selected_key: "city",
        option_by_index: false
    }

</script>

<SingleOption  {SingleFormData} />