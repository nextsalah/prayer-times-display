<script lang="ts">
    import Form from "../components/Form.svelte";
    import type { IFormData, VaktijaEULocations } from "../interfaces";
    import { Country } from "../country_list";
    import vaktijaeu_logo from "$lib/assets/imgs/vaktijaeu.jpeg";


    let country_selected: string;
    let city_selected: string;

    type SelectOptionType = {name: string, value: string};
    let all_cities: {[key: string]: SelectOptionType[]} = {};
    let all_countries: SelectOptionType[] = [];

    const FormData: IFormData = {
        source_name: "Vaktija.eu",
        source_logo_src: vaktijaeu_logo,
        source_link: "https://vaktija.eu/",
        end_point: "/vaktijaeu",
        handleData: ( locations ) => handleFetchData(locations as VaktijaEULocations),
    }


    const handleFetchData = ( locations : VaktijaEULocations ) => {
        for (let location of locations.data) {
            all_cities[location.country.short_code] = all_cities[location.country.short_code] || [];
            all_cities[location.country.short_code].push({
                name: location.name,
                value: location.slug
            });
            
            // Get the country name from the country list
            let country_name =   Object.keys(Country)[(Object.values(Country) as string[]).indexOf(location.country.short_code)];

            // Dont push if the country is already in the array
            if ( all_countries.find(country => country.value === location.country.short_code) ) continue;
            
            // Sort the countries by name
            all_countries.sort((a, b) => a.name.localeCompare(b.name));

            all_countries.push({
                name: country_name,
                value: location.country.short_code
            });
        }
    }

</script>


<Form FormData={FormData}>
    <label class="input input-bordered flex items-center gap-2">
        Choose a country
        <select class="mt-2" bind:value={country_selected} required name="country_code">
            <option value=""> -- Select a country -- </option>
            {#each all_countries as country}
                <option value={country.value}>{country.name}</option>
            {/each}
        </select>
    </label>
    {#if country_selected}
        <label class="input input-bordered flex items-center gap-2">
            Choose a city
            <select class="mt-2" bind:value={city_selected} required name="location_slug">
                {#each all_cities[country_selected] as city}
                    <option value={city.value}>{city.name}</option>
                {/each}
            </select>
        </label>
    {/if}
</Form>

