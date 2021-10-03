<script lang="ts">
export let title: string;
export let nextURL: string;
export let nextText: string;
export let backURL: string;
export let backText: string;
</script>

<div class="min-h-screen bg-gray-200 flex flex-col">
    <header>
        <slot name="header"></slot>
    </header>
    <main class="flex-grow bg-white rounded-md overflow-y-auto">
        <slot name="main"></slot>
    </main>
    <footer>
        <button class="float-left" href={backURL}>{backText}</button>
        <button class="float-right" href={nextURL}>{nextText}</button>
    </footer>
</div>

