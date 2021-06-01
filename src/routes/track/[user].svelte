<script lang="ts" context="module">
    //export const hydrate = true;
    export const prerender = true;
</script>

<script lang="ts">
import { onMount } from "svelte";
import * as maplibre from 'maplibre-gl';

let map;
let container;

export let data;
export let updating = false;

onMount(async () => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/mapbox-gl/dist/mapbox-gl.css';

    link.onload = async () => {
        map = new maplibre.Map({
            container,
            style: 'https://api.maptiler.com/maps/2e9f2f5e-7759-444e-9b9d-f2ff18fe2828/style.json?key=es2gj1CBla7a4NVQzHHV',
        });

        map.on('load', async () => {
            updating = true;
            const resp = await getData();
            updating = false;
            if (resp) {
                map.addSource('track', {
                    type: 'geojson',
                    data: resp.data
                });
                map.addLayer({
                    'id': 'track',
                    'type': 'line',
                    'source': 'track',
                    'layout': {
                        'line-join': 'round',
                        'line-cap': 'round'
                    },
                    'paint': {
                        'line-color': '#4361ee',
                    }
                });
                map.setPaintProperty('track', 'line-width', [
                    'interpolate',
                    // Set the exponential rate of change to 0.5
                    ['exponential', 0.5],
                    ['zoom'],
                    // When zoom is 15, line width larger
                    15,
                    4,
                    // When zoom is 18 or higher, line skinnier
                    18,
                    8
                ]);
                map.fitBounds(resp.bbox, {
                    linear: true,
                    padding: {top: 20, bottom:20, left: 20, right: 20}
                });
            }
        });
        
    };

    document.head.appendChild(link);

    

    return () => {
        map.remove();
        link.parentNode.removeChild(link);
    };
})

const getData = async () => {
    updating = true;
    const resp = await fetch('https://api.mototripper.app/track/~test');
    console.log(resp);
    updating = false;
    if (resp.ok) {
        data = await resp.json();
        return data;
    }
    return null;
}

const updateMap = (data) => {
    if (!map) {
        return
    }
    map.getSource('track').setData(data.data);
    map.fitBounds(data.bbox, {
        linear: true,
        padding: {top: 120, bottom:40, left: 40, right: 40}     
    });
}

const refresh = async () => {
    const resp = await getData();
    if (resp) {
        updateMap(resp);
    }
}

</script>

<div bind:this={container}>
    {#if map}
        <slot></slot>
    {/if}
    <button class="refresh" on:click={refresh} disabled={updating}>
        {#if updating}
        Updating...
        {:else}
        Update track
        {/if}
    </button>
</div>

<style>
    div {
        width: 100%;
        height: 100vh;
        z-index: 0;
    }

    .refresh {
        cursor: pointer;
        background: #ffffff;
        height: 40px;
        position: absolute;
        top: 40px;
        left: 40px;
        z-index: 100;
        border: 2px solid #333;
        border-radius: 20px;
        box-shadow: 0 4px 6px 0 hsla(0, 0%, 0%, 0.2);
        width: 140px;
        padding-left: 10px;
        padding-right: 10px;
    }
</style>