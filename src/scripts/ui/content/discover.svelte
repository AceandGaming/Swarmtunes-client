<script lang="ts">
    import type { Song, Collection } from "@ts/models"
    import { onMount } from "svelte"
    import ItemCards from "@ts/ui/item-cards.svelte"
    import PlaybackState from "@ts/playback.svelte"
    import { Search } from "@ts/api/song"
    import ItemList from "@ts/ui/item-list.svelte"
    import { IconX } from "@tabler/icons-svelte-runes"
    import { GetDiscover } from "./discover.svelte.ts"

    let loading = $state(true)

    let setlists: Collection[] = $state([])
    let discs: Collection[] = $state([])
    let originals: Song[] = $state([])
    let mashups: Song[] = $state([])

    async function LoadDiscover() {
        loading = true
        let data = await GetDiscover()

        setlists = data.setlists.toSorted((a, b) => b.date!.getTime() - a.date!.getTime())
        discs = data.discs.toSorted((a, b) => b.disc! - a.disc!)
        originals = data.originals.toSorted((a, b) => b.dateReleased.getTime() - a.dateReleased.getTime())
        mashups = data.mashups.toSorted((a, b) => b.dateReleased.getTime() - a.dateReleased.getTime())

        loading = false
    }

    onMount(() => {
        LoadDiscover()
    })

    let query: string = $state("")
    let debouncedQuery = $state('');
    let searching = $derived(query.length > 0)

    $effect(() => {
        query;
        const timeout = setTimeout(() => {
            debouncedQuery = query
        }, 200)

        return () => clearTimeout(timeout);
    })

</script>

<div id="discover">
    <div class="top">
        {#if !window.isMobile}
            <button class="swarmfm-button" title="Play SwarmFM!" onclick={() => PlaybackState.Play({ swarmfm: true})}></button>
        {/if}
        <div class="search">
            <input type="search" bind:value={query} placeholder="search for a song!">
            {#if searching}
                <button class="clear-search icon-button" onclick={() => query = ""}><IconX /></button>
            {/if}
        </div>
    </div>

    {#if searching}
        {#await Search(debouncedQuery)}
            <div class="loading-text"></div>
        {:then songs}
            <ItemList items={songs} onItemClick={(song) => PlaybackState.Play({song, songs})}/>
        {/await}
    {:else}
        {#if loading}
            <div class="loading-text"></div>
        {:else}
            <h1>Setlists</h1>
            <ItemCards items={setlists} />

            <h1>Originals</h1>
            <ItemCards items={originals} />

            <h1>Mashups</h1>
            <ItemCards items={mashups} />

            <h1>Discs</h1>
            <ItemCards items={discs} />
        {/if}
    {/if}
</div>

<style>
    .loading-text {
        margin: auto;
    }

    #discover {
        padding-left: 20px;
        padding-top: 20px;
        overflow-y: auto;
    }

    .top {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 20px;

        margin-bottom: 20px;
    }

    .swarmfm-button {
        width: 50px;
        height: auto;
        min-height: 50px;
        border-radius: 50%;
        background-image: url(/icons/swarmfm.png);
        background-size: 45px;
        background-repeat: no-repeat;
        background-position: center;
    }

    .search {
        position: relative;
    }

    .search input {
        padding-right: 40px;
    }


    .clear-search {
        position: absolute;
        top: 50%;
        right: 10px;
        transform: translateY(-50%);
        cursor: pointer;
    }
    .clear-search:active {
        transform: translateY(-50%) scale(0.9);
    }

    h1 {
        font-family: Neuro, system-ui, sans-serif;
        margin: 0;
        font-size: 40px;
        font-weight: 700;

    }

    .loading-text {
        margin: 0 auto;
    }

    #discover > :global(.item-cards) {
        margin-bottom: 40px;
    }

    @media (max-width: 600px) {
        .top {
            justify-content: center;
        }
    }
</style>
