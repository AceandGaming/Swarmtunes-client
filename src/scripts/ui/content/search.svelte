<script lang="ts">
    import ItemList from "@ts/ui/item-list.svelte"
    import { Search } from "@ts/api/song"
    import  PlaybackState from "@ts/playback.svelte.ts"

    let query: string = $state("")
    let debouncedQuery = $state('');

    $effect(() => {
        query;
        const timeout = setTimeout(() => {
            debouncedQuery = query
        }, 200)

        return () => clearTimeout(timeout);
    })

</script>

<div id="search">
    <input type="search" bind:value={query} placeholder="search for a song!">
    {#if query !== debouncedQuery}
        <div class="loading-text"></div>
    {:else}
        {#await Search(debouncedQuery)}
            <div class="loading-text"></div>
        {:then songs}
            <ItemList items={songs} onItemClick={(song) => PlaybackState.Play({song, songs})}/>
        {/await}
    {/if}
</div>

<style>
    #search {
        padding: 0 max(5px, 8vw);
    }
    input {
        flex: 0 1 auto;
        display: block;
        height: 40px;
        width: 60vw;
        margin: 20px auto;
    }
    .loading-text {
        margin: 20px auto;
    }

    @media (max-width: 550px) {
        input {
            width: 80vw;
            font-size: 1rem;
        }
    }
</style>