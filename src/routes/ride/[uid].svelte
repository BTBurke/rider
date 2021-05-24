<script lang="ts" context="module">
    export const hydrate = true;
</script>

<script lang="ts">
    import {onMount} from 'svelte';
    import { position } from '$lib/stores/position';
    import { Tracker, UpdateResponse } from '$lib/tracker';

    export let supported = false;
    export let watchID: number|null;
    export let trackerStatus: UpdateResponse;
    const tracker = new Tracker('test');
    const unsubscribe = tracker.subscribe((resp: UpdateResponse) => {
        trackerStatus = resp;
    })


    onMount(() => {
        if (!navigator.geolocation) {
            supported = false;
        } else {
            supported = true;
            navigator.geolocation.getCurrentPosition((pos) => position.set(pos), () => supported = false);
        }

        return () => {
            tracker.stop();
            pauseTrack();
            unsubscribe();
        }
    })
    const startTrack = () => {
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
            <button on:click={startTrack}>Start track</button>
        {/if}
        <p>Tracker Status</p>
        <p>OK: ${trackerStatus.ok}</p>
        <p>Queue Len: ${trackerStatus.positionQueueLength}</p>
{/if}