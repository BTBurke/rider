<script context="module">
	export const ssr = false;
</script>

<script>
import { onMount } from 'svelte';
import { createEditor } from 'svelte-editorjs';

let e, d, r;
let editorRef;
onMount(async () => {
    const module = await import('@editorjs/header'); 
    const { editor, data, isReady } = createEditor({
        tools: {
            header: {
                class: module.default,
                config: {
                    placeholder: 'Enter a header',
                    levels: [1, 2, 3, 4],
                    defaultLevel: 1
                }
            }
        }
    });
    e = editor;
    d = data;
    r = isReady;    
});
</script>

<div id="editor" bind:this={editorRef}>
    {#if r}
        <div use:e >
        </div>
    {/if}
</div>
