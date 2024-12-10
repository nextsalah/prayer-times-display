<script lang="ts">
    /*
    * This component is used for all the single option forms.
    * It is used to get the options from the api and display them in a select.
    * @param singleOptionProps
    */
	import Form from "../components/Form.svelte";
    import type { SingleOptionLocation, ISingleOptionProps, IFormData } from "../interfaces";
        
    
    export let SingleFormData: ISingleOptionProps;
    const FormData = {
        ...SingleFormData,
        handleData: ( locations ) => handleFetchData(locations as SingleOptionLocation),
    } as IFormData & ISingleOptionProps;

    type SingleOption = { value: string | number, name: string };
    let options: SingleOption[] = [];
    let selected: string;

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
    <div class="form-control w-full">
        <label class="label" for="country-select">
            <span class="label-text text-base-content">
                {FormData.select_label}
            </span>
        </label>
        <select 
            id="country-select"
            class="select select-bordered w-full focus:select-primary"
            bind:value={selected} 
            name={FormData.selected_key}
            required={true}
        >
            <option value="" disabled selected>Choose a country from the list</option>
            {#each options as option}
                <option value={option.value}>{option.name}</option>
            {/each}
        </select>
        <label class="label" for="country-select">
            <span class="label-text-alt text-base-content/60">Select your country to get prayer times</span>
        </label>
    </div>
</Form>
