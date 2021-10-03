
<script lang="ts">
import { onMount } from 'svelte';
import { createEditor } from 'svelte-editorjs';

let editor, data, isReady;
export let imageUploadByFile: String;
export let imageUploadByURL: String;
export let initialData = {blocks: []};
export let autofocus: boolean = false;

onMount(async () => {
    const header = await import('@editorjs/header');
    const image = await import('@editorjs/image');
    const delimiter = await import('@editorjs/delimiter');

    const e = createEditor({
        autofocus: autofocus,
        data: initialData,
        placeholder: 'Now give us the details and pics...',
        tools: {
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
                    byFile: imageUploadByFile, // Your backend file uploader endpoint
                    byUrl: imageUploadByURL, // Your endpoint that provides uploading by Url
                    }
                }
            },
            delimiter: {
                class: delimiter.default
            }       
        }
    });
    editor = e.editor;
    data = e.data;
    isReady = e.isReady;    
});
</script>

<div id="editor" class="text-gray-900">
    {#if isReady}
        <div class="editor-box" use:editor >
        </div>
    {/if}
</div>

<style global>
    #editor .editor-box {
        width: 100%;
        height: 100%;
    }
    #editor div, p {
        font-family: 'Lusitania';
    }
    #editor a {
        text-decoration-color: #1F7A8C;
        text-decoration-thickness: 3px;
    }
    #editor a:after {
        content: '⎋';
        margin-left: 0.1rem;
        display: inline-block;
        color: #1F7A8C;
        font-size: 0.8rem;
        text-decoration: none;
        transform: rotate(90deg) translateX(-0.2rem);
    }
    #editor h1 {
        font-family: 'Raleway';
        @apply text-2xl;
    }
    #editor h2 {
        font-family: 'Raleway';
        @apply text-xl;
        @apply font-bold;
    }
    #editor h3 {
        font-family: 'Raleway';
        @apply text-lg;
        @apply font-bold;
    }
</style>
