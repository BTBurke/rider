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

onMount(async () => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/mapbox-gl/dist/mapbox-gl.css';

    link.onload = async () => {
        map = new maplibre.Map({
            container,
            style: 'https://api.maptiler.com/maps/2e9f2f5e-7759-444e-9b9d-f2ff18fe2828/style.json?key=es2gj1CBla7a4NVQzHHV',
        });

        const resp = await fetch('https://api.mototripper.app/track/~scooter');
        console.log(resp);
        if (resp.ok) {
            const body = await resp.json();
            console.log(body);
            map.addSource('track', {
                type: 'geojson',
                data: body.data
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
            'line-width': 10
            }
            });
            map.fitBounds(body.bbox);
        }
    };

    document.head.appendChild(link);

    

    return () => {
        map.remove();
        link.parentNode.removeChild(link);
    };
})

</script>

<div bind:this={container}>
    {#if map}
        <slot></slot>
    {/if}
</div>

<style>
    div {
        width: 100%;
        height: 95vh;
    }
</style>