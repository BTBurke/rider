<script lang="ts">
import { setContext, onMount } from 'svelte';
import LngLat from '$lib/geo/types';
import * as L from 'leaflet';

export let showMiniMap: boolean = true;
export let bbox: [number, number, number, number];
export let center: LngLat = bbox ? [(bbox[0] + bbox[2])/2, (bbox[1] + bbox[3])/2] : [0,0];
export let zoom: number = 4;
let mapRef: HTMLElement;

onMount(() => {
    const map = L.map(mapRef, {
        center: center,
        zoom: zoom
    });

    if ($$slots) {
        setContext("map", map)
    }
    

})


</script>

<div id="map" bind:this={mapRef}>
    {#if $$slots}
        <slot></slot>
    {/if}
</div>

<style>
    #map {
        width: 100%;
        height: 100%;
    }
</style>