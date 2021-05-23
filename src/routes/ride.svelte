<script lang="ts" context="module">
    export const hydrate = true;
</script>

<script lang="ts">
    import {onMount} from 'svelte';
    import { position } from '$lib/stores/position';
    export let supported = false;
    export let watchID;

    onMount(() => {
        if (!navigator.geolocation) {
            supported = false;
        } else {
            supported = true;
            navigator.geolocation.getCurrentPosition((pos) => position.set(pos), () => supported = false);
        }
    })
    const startWatch = () => {
        watchID = navigator.geolocation.watchPosition((pos) => position.update(pos), null, {enableHighAccuracy: true});
    }
    const pauseTrack = () => {
        navigator.geolocation.clearWatch(watchID);
        watchID = null;
    }
</script>
{#if !supported}
    <p>Enable geolocation to track your ride</p>
{:else}
        <p>Position - Lat: {$position.coords?.latitude} Long: {$position.coords?.longitude} Last Update: {$position?.timestamp}</p>
        {#if watchID}
            <button on:click={pauseTrack}>Pause tracking</button>
        {:else}
            <button on:click={startWatch}>Start track</button>
        {/if}
{/if}