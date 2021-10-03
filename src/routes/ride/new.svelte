<script context="module">
	export const ssr = false;
</script>

<script>
import { onMount } from 'svelte';
import { createEditor } from 'svelte-editorjs';

let e, d, r;
let editableRef;
let summaryReady = false;

onMount(async () => {
    const header = await import('@editorjs/header');
    const image = await import('@editorjs/image');

    const { editor, data, isReady } = createEditor({
        autofocus: false,
        data: {
            blocks: []
        },
        placeholder: 'Now give us the details and pics...',
        tools: {
            summary: {
                class: header.default,
                config: {
                    placeholder: 'Give us a one line summary of the ride...',
                    levels: [1],
                    defaultLevel: 1,
                    inlineToolbar: false
                }
            },
            header: {
                class: header.default,
                config: {
                    placeholder: 'Enter a header',
                    levels: [2, 3],
                    defaultLevel: 2,
                    inlineToolbar : true
                }
            },
            image: {
                class: image.default,
                config: {
                    endpoints: {
                    byFile: 'http://localhost:8008/uploadFile', // Your backend file uploader endpoint
                    byUrl: 'http://localhost:8008/fetchUrl', // Your endpoint that provides uploading by Url
                    }
                }
            }       
        }
    });
    e = editor;
    d = data;
    r = isReady;    
});
</script>

<div id="editor" class="container mx-auto">
    <h2>Ride Summary</h2>
    <div class="editable" contenteditable data-placeholder="Give us a one-line summary of your ride..." on:keyup={(e) => { console.log(e.target.textContent); summaryReady = e.target.textContent.length > 0} } bind:this={editableRef}></div>
    {#if r && summaryReady}
        <h2>Trip Report</h2>
        <div class="editor-box" use:e >
        </div>
    {/if}
</div>

<style global>
    .editable {
        @apply text-2xl;
        @apply mb-4;
    }
    #editor .editor-box {
        width: 100%;
        height: 100%;
    }
    .editable:empty:before {
        content: attr(data-placeholder);
    }
    #editor h1 {
        @apply text-2xl;
    }
    #editor h2 {
        @apply text-xl;
    }
    #editor h3 {
        @apply text-lg;
        @apply font-bold;
    }
</style>