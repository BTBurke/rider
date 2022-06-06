<script lang="ts" context="module">
    import { getLiveTrack } from '$lib/api';
    export const prerender = true;

    export async function load({ page, fetch, session, context }) {
        const res = await getLiveTrack(page.params.user, fetch);

		if (res.ok) {
			return {
				props: {
					data: res?.data,
                    user: page.params.user
				}
			};
		}

		return {
			status: res.status,
			error: new Error(res?.error)
		};
	}
</script>

<script lang="ts">
import { onMount } from "svelte";
import * as maplibre from 'maplibre-gl';
import { liveTrack } from '$lib/stores/live';
import type { LiveTrackServerResponse } from '$lib/api';
import WiRefresh from 'svelte-icons/wi/WiRefresh.svelte';

let map;
let container;

export let data: LiveTrackServerResponse;
export let user;

export let updating = false;
export let mapReady = false;

onMount(async () => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/mapbox-gl.css';

    link.onload = async () => {
        let options = {
            container,
            style: 'https://api.maptiler.com/maps/2e9f2f5e-7759-444e-9b9d-f2ff18fe2828/style.json?key=es2gj1CBla7a4NVQzHHV',   
        }
        if (data) {
            options = Object.assign(options, 
            {
                bounds: data.bbox, 
                boundsOptions: {
                    linear: true,
                    padding: {top: 120, bottom:20, left: 20, right: 20}
                }
            });
        }
        map = new maplibre.Map(options);
        liveTrack.setMapInstance(map);
        map.on('zoom', () => {
            console.log('zoom: ', map.getZoom());            
        })
        map.on('load', async () => {
                liveTrack.set(data);
                mapReady = true;      
        });
    };
    document.head.appendChild(link);

    return () => {
        map.remove();
        link.parentNode.removeChild(link);
    };
})

const refresh = async () => {
    updating = true;
    const res = await getLiveTrack(user);
    if (res.ok) {
        liveTrack.update(res?.data);
    }
    updating = false;
}
</script>

<div class="map" bind:this={container}>
    {#if map && mapReady}
        <slot></slot>
    {/if}
    {#if $liveTrack?.last_position.display}
        <div class="mt-4 z-50 absolute t-0 w-screen">
            <div class="p-0 bg-white flex flex-row flex-space-between max-w-md md:max-w-md w-auto rounded-lg mr-2 ml-2 md:m-auto">
                    <div class="flex-grow m-auto ml-4 lg:text-lg">{updating ? "Updating..." : $liveTrack.last_position.display}</div>
                    <div class="mr-1 m-auto" on:click={refresh}>
                        <button class="w-12 h-12 text-2xl" on:click={refresh} disabled={updating}>
                            <WiRefresh/>
                        </button>
                    </div>
            </div>
        </div>
    {/if}
</div>

<style>
    .map {
        width: 100%;
        height: 100vh;
        z-index: 0;
    }
    .center {
        position: relative;
        background: #fff;
        width: 250px;
        border-radius: 20px;
        box-shadow: 0 4px 6px 0 hsla(0, 0%, 0%, 0.2);
        padding-left: 20px;
        padding-right: 20px;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
        margin: auto;
    }
    .loc {
        position: absolute;
        top: 0;
        width: 100%;
        z-index: 100;
        margin-top: 20px;
    }
    .inline {
        display: inline-flex;
    }
    .loc-1 {
        width: 200px;
        line-height: 1.1rem;
        margin: auto;
    }
    .refresh {
        cursor: pointer;
        background: #ffffff;
        font-size: 2rem;
        color: #333;
        padding: 0;
        height: 40px;
        width: 40px;
        margin: auto;
        margin-left: 5px;
        border: 2px solid #333;
        border-radius: 20px;
        box-shadow: 0 4px 6px 0 hsla(0, 0%, 0%, 0.2);
    }
</style>
