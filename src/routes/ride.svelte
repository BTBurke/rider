<script lang="ts" context="module">
    export const hydrate = true;
</script>

<script lang="ts">
    import {onMount} from 'svelte';
    export let position;
    export let supported = false;

    onMount(() => {
        if (!navigator.geolocation) {
            supported = false;
        } else {
            supported = true;
            navigator.geolocation.getCurrentPosition((pos) => position = pos, () => supported = false)
        }
    })
    
</script>
{#if !supported}
    <p>Enable geolocation to track your ride</p>
{:else}
    {#if position}
        <p>Position - Lat: {position.coords.latitude} Long: {position.coords.longitude}</p>
    {:else}
        <p>Getting fix...</p>
    {/if}
{/if}