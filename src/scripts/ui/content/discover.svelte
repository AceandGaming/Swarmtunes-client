<script lang="ts">
    import { GetDiscoverPage } from "@ts/api/pages"
    import type { Song, Collection } from "@ts/models"
    import { onMount } from "svelte"
    import ItemCards from "@ts/ui/item-cards.svelte"

    let loading = $state(true)

    let setlists: Collection[] = $state([])
    let discs: Collection[] = $state([])
    let originals: Song[] = $state([])
    let mashups: Song[] = $state([])

    async function LoadDiscover() {
        loading = true
        let data = await GetDiscoverPage()

        setlists = data.setlists.toSorted((a, b) => b.date!.getTime() - a.date!.getTime())
        discs = data.discs.toSorted((a, b) => b.disc! - a.disc!)
        originals = data.originals.toSorted((a, b) => b.dateReleased.getTime() - a.dateReleased.getTime())
        mashups = data.mashups.toSorted((a, b) => b.dateReleased.getTime() - a.dateReleased.getTime())

        loading = false
    }

    onMount(() => {
        LoadDiscover()
    })

</script>

<div id="discover">
    <button id="swarmfm-button" title="Play SwarmFM!" data-rightclickcategory="swarmfm"></button>
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
</div>

<style>
    .loading-text {
        margin: auto;
    }

    #swarmfm-button {
        width: 50px;
        height: auto;
        min-height: 50px;
        border-radius: 50%;
        background-image: url(/icons/swarmfm.png);
        background-size: 45px;
        background-repeat: no-repeat;
        background-position: center;
        }

    #discover h1 {
        font-family: Neuro, system-ui, sans-serif;
        margin: 0;
        font-size: 40px;
        font-weight: 700;

        }

    #discover > .loading-text {
        margin: 0 auto;
    }

    #discover > :global(.item-cards) {
        flex: 0 0 auto;
        margin-bottom: 40px;
    }
</style>
