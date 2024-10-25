<script lang="ts">
    /*
    * This component is used for all the single option forms.
    * It is used to get the options from the api and display them in a select.
    * @param singleOptionProps
    */
	import Form from "../components/Form.svelte";
    import type { SingleOptionLocation, ISingleOptionProps, IFormData } from "../interfaces";
        
    
    interface Props {
        SingleFormData: ISingleOptionProps;
    }

    let { SingleFormData }: Props = $props();
    const FormData = {
        ...SingleFormData,
        handleData: ( locations ) => handleFetchData(locations as SingleOptionLocation),
    } as IFormData & ISingleOptionProps;

    type SingleOption = { value: string | number, name: string };
    let options: SingleOption[] = [];
    let selected: string = $state();

    // Get the options from the api
    const handleFetchData = (locations : SingleOptionLocation) => {
        for ( const [index, location] of locations.entries() ) {
            if ( FormData.option_by_index ) {
                options.push({ value: index.toString(10), name: location });
            } else {
                options.push({ value: location, name: location });
            }
        }
    }

</script>


<Form {FormData}>
    <label>
        {FormData.select_label}
        <select 
            class="mt-2" 
            bind:value={selected} 
            name={FormData.selected_key}
            required={true}
        >
            {#each options as option}
                <option value={option.value}>{option.name}</option>
            {/each}
        </select>
    </label>
</Form>
