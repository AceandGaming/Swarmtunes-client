<script lang="ts">
    import type { Song } from "@ts/types/song"
    import SongList from "@ts/ui/song-list.svelte"
    import "@ts/ui/cover"
    import xSvg from "@assets/icons/x.svg?raw"
    import playSvg from "@assets/icons/play.svg?raw"
    import { HideContentTabs, ShowContentTabs } from "@ts/ui/header"
    import SongQueue from "@ts/song-queue"
    import { PlaybackController } from "@ts/playback"

    let title = $state("Title")
    let subtitle = $state("")
    let artworkUrl = $state("")
    let songs: Song[] = $state([])
    let loading = $state(true)
    let visable = $state(false)

    export function UpdateMeta(newTitle: string, newSubtitle: string, newArtworkUrl: string) {
        title = newTitle
        subtitle = newSubtitle
        artworkUrl = newArtworkUrl
    }
    export function UpdateSongs(newSongs: Song[]) {
        songs = newSongs
    }
    export function SetLoading(state: boolean) {
        loading = state
    }

    export function Show() {
        visable = true
        HideContentTabs()
    }
    export function Hide() {
        visable = false
        ShowContentTabs()
    }

    let search: string = $state("")
    let currentSongs: Song[] = $derived(
        songs.filter(song => song.Title.toLowerCase().includes(search.toLowerCase()))
    )

    function OnItemClick(song: Song) {
        SongQueue.LoadSongs(songs)
        SongQueue.UpdateQueue(song)
        PlaybackController.PlaySong(song)
    }
    function OnCoverClick() {
        SongQueue.LoadSongs(songs)
        if (SongQueue.suffleSongs) {
            SongQueue.UpdateQueue()
        }
        else {
            SongQueue.UpdateQueue(songs[0])
        }
        PlaybackController.PlaySong(SongQueue.currentSong)
    }

</script>

<div 
    id="media-view"
    class:loading
    class:visable

    style={`--artwork-url: url(${artworkUrl})`}
>
    <header>
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        
        <div class="cover">
            <swarmtunes-cover src={artworkUrl} onclick={OnCoverClick} role="button" tabindex="0"></swarmtunes-cover>
            <div class="overlay">{@html playSvg}</div>
        </div>
        <div class="text-container">
            <h1>{title}</h1>
            <h2>{subtitle}</h2>
            {#if loading}
                <h3>Loading...</h3>
            {:else}
                <h3>{songs.length} Songs</h3>
            {/if}
        </div>
        <nav>
            <input class="search" bind:value={search} placeholder="Search" type="text">
        </nav>
        <button class="close icon-button" onclick={() => Hide()}>{@html xSvg}</button>
    </header>
    <div class="content">
        {#if loading}
            <div class="loading-text"></div>
        {:else}
            <SongList songs={currentSongs} catagory="playlist-item" onClick={OnItemClick}/>
        {/if}
    </div>
</div>


<style>
    * {
        box-sizing: border-box;
    }
    #media-view {
        display: none;
        overflow-y: auto;
    }
    #media-view.visable {
        display: block
    }

    button.close {
        position: absolute;
        top: 20px;
        right: 20px;
        width: 30px;
    }

    header {
        position: relative;
        display: grid;
        grid-template-columns: min(16vw, 250px) 1fr;
        padding: 20px;
        gap: 20px;

        border-bottom: solid 2px var(--subtext-colour);
    }
    header::before {
        content: "";
        position: absolute;
        inset: 0;
        height: 100%;
        transform: scale(1.02);

        background: no-repeat center/cover;
        background-image: var(--artwork-url);

        filter: blur(3px) brightness(0.55)
    }

    header > .cover {
        position: relative;
        filter: drop-shadow(0 4px 8.5px rgba(0, 0, 0, 40%));
        aspect-ratio: 1;
        max-width: 100%;
        margin: auto;
        cursor: pointer;
    }
    header swarmtunes-cover {
        transition: filter 0.1s ease-in-out;
    }
    header > .cover:hover swarmtunes-cover {
        filter: brightness(0.5);
    }
    header > .cover .overlay {
        position: absolute;
        inset: 0;
    
        display: flex;
        
        align-items: center;
        justify-content: center;

        opacity: 0;
        transform: scale(0.4);
        
        transition: opacity 0.1s ease-in-out, transform 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    header > .cover:hover .overlay {
        opacity: 1;
        transform: scale(0.75);
    }

    header .text-container {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 10px 0;
    }
    header .text-container > * {
        filter: drop-shadow(0 4px 4px rgba(0, 0, 0, 40%));
        white-space: wrap;
    }

    header :is(h1, h2, h3) {
        margin: 0;
        text-align: left;
    }

    header h1 {
        font-size: clamp(24px, 6vw, 48px);
        font-weight: 900;
        color: white;
    }
    header h2 {
        font-size: clamp(16px, 4vw, 32px);
        font-weight: bold;
        color: #FFFFFFCC;
    }
    header h3 {
        font-size: clamp(12px, 2vw, 15px);
        font-weight: normal;
        color: #FFFFFFCC;
    }

    header > nav {
        grid-column: 1 / -1;
        z-index: 0;
    }
    header > nav .search {
        filter: opacity(0.8);
        transition: filter 0.2s ease-in-out;
        padding: 5px 10px;
    }
    header > nav .search:focus {
        filter: opacity(1);
    }

    .content {
        padding: 20px;
    }
    .content > .loading-text {
        margin: auto auto;
    }

    @media (max-width: 700px) {
        header {
            grid-template-columns: 1fr;
        }
        header .text-container {
            padding: 0;
        }
        header > .cover {
            display: none;
        }
    }
    @media (max-width: 600px) {
        button.close {
            right: 10px;
            width: 35px;
        }
        .content {
            padding: 10px 5px;
        }
        header > nav .search {
            font-size: 16px;
            height: 35px;
        }
    }

</style>