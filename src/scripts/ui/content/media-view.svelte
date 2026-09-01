<script lang="ts">
    import { IconX, IconPlayerPlayFilled, IconDownload } from "@tabler/icons-svelte-runes"
    import { Song } from "@ts/models/song"
    import SongList from "@ts/ui/item-list.svelte"
    import Cover from "@ts/ui/cover.svelte"
    import PlaybackController from "@ts/playback"
    import MediaView from "./media-view.svelte.ts"
    import { CreateSongContextMenu } from "@ts/context-menus"
    import { ContextMenuGroup } from "@ts/context-menu.svelte.ts"
    import PlaylistProvider from "@ts/playlist-provider"
    import { Playlist } from "@ts/models/playlist.ts"
    import { Download as DownloadSongs } from "@ts/song-downloads.ts"

    let loading = $state(true)

    let songs: Song[] = $state([])
    let media = $derived(MediaView.media)

    let search: string = $state("")
    let currentSongs: Song[] = $derived(
        songs.filter(song => song.title.toLowerCase().includes(search.toLowerCase()))
    )

    $effect(() => {
        if (!MediaView.media) {
            return
        }
        loading = true
        if (MediaView.media instanceof Song) {
            songs = [MediaView.media]
            loading = false
            return
        }
        MediaView.media.GetSongs().then(s => {
            loading = false
            songs = s
        })
    })

    function OnItemClick(song: Song) {
        PlaybackController.Play({song, songs})
    }
    function OnCoverClick() {
        if (loading) {
            return
        }
        PlaybackController.Play({songs})
    }

    function FormatDuration(seconds: number) {
        if (seconds > 3600) {
            const hours = Math.floor(seconds / 3600)
            const minutes = Math.floor((seconds % 3600) / 60)
            return `${hours}h ${minutes}m`
        }
        return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
    }
    function CreatePlaylistItemContextMenu(song: Song) {
        const menu = CreateSongContextMenu(song)
        menu.push({
            label: "Remove from playlist",
            group: ContextMenuGroup.Playlist,
            icon: IconX,
            Action: () => {
                if (!media) {
                    return
                }
                const id = media.id
                PlaylistProvider.RemoveSongsFromPlaylist(media.id, [song.id]).then(() => {
                    if (id !== media.id) {
                        return
                    }
                    songs = songs.filter(s => s.id !== song.id)
                })
            }
        })
        return menu
    }

</script>

<div 
    id="media-view"

    style:--artwork-url = {MediaView.media?.GetArtwork() ? `url("${MediaView.media.GetArtwork()}")` : undefined}
>
    <header>
        <div class="cover" onclick={OnCoverClick} role="button" tabindex="0">
            <Cover item={MediaView.media} class="cover-image"/>
            <div class="overlay"><IconPlayerPlayFilled size="unset" /></div>
        </div>
        <div class="text-container">
            <h1>{media?.displayTitle}</h1>
            <h2>{media?.displayDate}</h2>
            <h3>{media instanceof Song ? 1 : media?.songCount} Songs - {FormatDuration(media?.seconds ?? 0)}</h3>
        </div>
        <nav>
            <button class="icon-button play-button" onclick={OnCoverClick}><IconPlayerPlayFilled size=40 /></button>
            <input class="search" bind:value={search} placeholder="Search" type="text">
            {#if media instanceof Playlist}
                <button class="icon-button download" onclick={async () => await DownloadSongs(await media.GetSongs())}><IconDownload size=40 /></button>
            {/if}
        </nav>
        <button class="close icon-button" onclick={() => MediaView.Hide()}><IconX size="unset" /></button>
    </header>
    <div class="content">
        {#if loading}
            <div class="loading-text"></div>
        {:else}
            <SongList items={currentSongs} onItemClick={OnItemClick} contextMenu={media instanceof Playlist ? CreatePlaylistItemContextMenu : undefined }/>
        {/if}
    </div>
</div>


<style>
    #media-view {
        display: block;
        overflow-y: auto;
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
        height: 100%;
    }
    header :global(.cover-image) {
        width: 100%;
        transition: filter 0.1s ease-in-out;
    }
    @media (hover: hover) {
        header > .cover:hover :global(.cover-image) {
            filter: brightness(0.5);
        }
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
        display: flex;
        flex-direction: row;
        align-items: center;

        grid-column: 1 / -1;
        z-index: 0;
        gap: 5px;
    }
    header > nav .search {
        filter: opacity(0.8);
        transition: filter 0.2s ease-in-out;
        padding: 5px 10px;
        height: 30px;
    }
    header > nav .search:focus {
        filter: opacity(1);
    }
    header > nav .play-button {
        display: none;
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
        header > nav .play-button {
            display: block;
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