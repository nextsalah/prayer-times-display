<script lang="ts">
    import Form from "../components/Form.svelte";
    import type { IFormData, VaktijaEULocations } from "../interfaces";
    import { Country } from "../country_list";
    import vaktijaeu_logo from "$lib/assets/imgs/vaktijaeu.jpeg";

    let country_selected: string = $state();
    let city_selected: string = $state();

    type SelectOptionType = {name: string, value: string};
    let all_cities: {[key: string]: SelectOptionType[]} = $state({});
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
            
            let country_name = Object.keys(Country)[(Object.values(Country) as string[]).indexOf(location.country.short_code)];
            
            if ( all_countries.find(country => country.value === location.country.short_code) ) continue;
            
            all_countries.sort((a, b) => a.name.localeCompare(b.name));

            all_countries.push({
                name: country_name,
                value: location.country.short_code
            });
        }
    }
</script>

<Form {FormData}>
    <div class="space-y-1">
        <!-- Country Selection -->
        <div class="form-control w-full">
            <label class="label" for="country-select">
                <span class="label-text">Select Country</span>
            </label>
            <select 
                id="country-select"
                class="select select-bordered w-full focus:select-primary"
                bind:value={country_selected} 
                required 
                name="country_code"
            >
                <option value="" disabled selected>Choose a country from the list</option>
                {#each all_countries as country}
                    <option value={country.value}>{country.name}</option>
                {/each}
            </select>
            <label class="label" for="country-select">
                <span class="label-text-alt text-base-content/60">Select your country to see available cities</span>
            </label>
        </div>

        <!-- City Selection -->
        {#if country_selected}
            <div class="form-control w-full">
                <label class="label" for="city-select">
                    <span class="label-text">Select City</span>
                </label>
                <select 
                    id="city-select"
                    class="select select-bordered w-full focus:select-primary"
                    bind:value={city_selected} 
                    required 
                    name="location_slug"
                >
                    <option value="" disabled selected>Choose a city from the list</option>
                    {#each all_cities[country_selected] as city}
                        <option value={city.value}>{city.name}</option>
                    {/each}
                </select>
                <label class="label" for="city-select">
                    <span class="label-text-alt text-base-content/60">Select your city to get prayer times</span>
                </label>
            </div>
        {/if}
    </div>
</Form>