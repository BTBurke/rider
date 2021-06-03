<script>
import FilePond, { registerPlugin, supported } from 'svelte-filepond';
import './filepond.css';

// Import the Image EXIF Orientation and Image Preview plugins
// Note: These need to be installed separately
// `npm i filepond-plugin-image-preview filepond-plugin-image-exif-orientation --save`
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import './filepond-plugin-image-preview.min.css';

import {Sveltik, Form, Field} from 'sveltik';

// Register the plugins
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

// a reference to the component, used to call FilePond methods
let pond;
let error = null;
let isSubmitting = false;
let values = {
    file: '',
    caption: '',
}

// pond.getFiles() will return the active files

// the name to use for the internal file input
let name = 'file';

// handle filepond events
function handleInit() {
	console.log('FilePond has initialised');
}

function handleProcessFile(err, fileItem) {
	console.log('A file has been added', fileItem);
    console.log('server id', fileItem.serverId);
    values = Object.assign(values, {file: fileItem.serverId});
}

const checkMediaType = (item) => {
    error = null;
    if (!item.fileType.startsWith('image/')) {
        error = `${item.fileType} is not supported yet.  Only photos right now.`
        setTimeout(() => {
            error = null;
        }, 3000)
        return false;
    }
    return true;
}

const validate = values => {
    return null
}

const onSubmit = (evt) => {
    evt.preventDefault();
    isSubmitting = true;
    console.log(values);
    isSubmitting = false;
}

const handleCaptionChange = (evt) => {
    console.log(evt.target.value);
    values = Object.assign(values, {caption: evt.target.value});
}

</script>

<div class="w-full">
	    <form class="mx-4 my-4">
        <label class="block tracking-wide text-gray-700 text-sm font-bold mb-0 mb-1" for="caption">
            Say something interesting
        </label>
        <textarea on:change={handleCaptionChange} class="block relative resize-none border-2 border-primary border-b-0 w-full bg-white appearance-none py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white" rows="5" type="textarea" name="caption" form="post"/>
        <div class="bg-gray-100 w-full text-gray-700 border-2 border-gray-100">
            <FilePond bind:this={pond} {name}
                class="m-0 bg-gray-100 text-decoration-none"
		        server="http://localhost:8080/upload"
		        allowMultiple={false}
		        oninit={handleInit}
		        onprocessfile={handleProcessFile}
                required={true}
                labelIdle={'<span class="filepond--label-action image-upload-button"><img src="https://raw.githubusercontent.com/stephenhutchings/typicons.font/fc8eebf13239a44b16fa925f6de774adb8eb8643/src/svg/camera-outline.svg"></span></span>'}
                credits={{label: "", url: null}}
                acceptedFileTypes={["image/*"]}
                beforeAddFile={checkMediaType}
            />
        </div>
        <input type="hidden" name="file" id="file" />
        <button type="submit" on:click|preventDefault={onSubmit} disabled={isSubmitting}>Post</button>
        </form>
</div>
{#if error}
<div class="text-danger text-center w-screen text-sm">
    {error}
</div>
{/if}

<style global>

.filepond--root {
    margin: 0;
    padding:0;
    height: auto;
    min-height: 0;
}

.filepond--wrapper {
    height: auto;
    min-height: 0;
}

.filepond--panel-root {
    margin: 0;
    padding: 0;
    height: auto;
    min-height: 0;
}

.filepond--root [data-filepond-item-state='processing-complete'] .filepond--item-panel {
    background-color: transparent;
}

.filepond--image-preview-overlay-success {
    background-color: transparent;
    color: transparent;
}

.filepond--root .filepond--drop-label {
    height: auto;
    min-height: 0;
    text-align: left;
    justify-content: left;
    align-items: left;
    @apply bg-gray-100;
}

.image-upload-button {
    @apply bg-gray-100;
    text-decoration: none;
    min-width: 80px;
    min-height: 80px;
}

</style>
