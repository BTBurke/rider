<script context="module">
	export const ssr = false;
</script>

<script>
    import Editor from '$lib/components/Editor.svelte';
    import Step from '$lib/components/Step.svelte';
    let summaryReady = false;
</script>

<div id="editor" class="container mx-auto">
    <Step backURL="/test" backText="back" nextURL="/next" nextText="next">
        <div slot="header">
            <h2 class="font-display-bold">Ride Summary</h2>
        </div>
        <div slot="main">
            <div class="editable" contenteditable data-placeholder="Give us a one-line summary of your ride..." on:keyup={(e) => { console.log(e.target.textContent); summaryReady = e.target.textContent.length > 0} }></div>
            {#if summaryReady}
                <h2>Trip Report</h2>
                <Editor imageUploadByFile={'http://localhost:8080/shart'} imageUploadByURL={'http://localhost:8080/shart'} />
            {/if}
        </div>
    </Step>
</div>

<style>
    .editable {
        @apply text-2xl;
        @apply mb-4;
    }
    .editable:empty:before {
        content: attr(data-placeholder);
    }
</style>