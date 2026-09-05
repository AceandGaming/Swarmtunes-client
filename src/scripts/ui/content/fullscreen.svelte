<script lang="ts">
    import { IconPlaylistAdd, IconX, IconShare3, IconDots, IconBrandYoutube as IconVideo } from "@tabler/icons-svelte-runes";
    import Cover from "@ts/ui/cover.svelte"
    import Seek from "@ts/ui/controls/seek.svelte";
    import MediaControls from "@ts/ui/controls/media-controls.svelte";
    import Playback from "@ts/playback.svelte"
    import fullscreen from "./fullscreen.svelte.ts"
    import type { Color } from "colorthief"
    import PlaylistProvider from "@ts/playlist-provider.ts"
    import { SelectPlaylist } from "@ts/ui/popup.svelte.ts"
    import { CreateSongContextMenu } from "@ts/context-menus/song.ts"
    import { CopyToClipboard } from "@ts/ui/popup.svelte.ts"
    import ContextMenu from "@ts/context-menu.svelte.ts"
    import { ShareSongV1 } from "@ts/api/song.ts"
    import { GetSongColour } from "@ts/misc.ts";
    
    let fullscreenElement: HTMLDivElement

    let colour: Color | undefined = $state()

    let topColour = $state("var(--background)");
    let bottomColour = $state("var(--background)");

    let wakeLock: any

    let showVideo: boolean = $state(false)

    $effect(() => {
        if (!Playback.iframe || !fullscreen.visible) {
            showVideo = false
        }
    })
    $effect(() => {
        if (!Playback.currentSong) {
            return
        }
        GetSongColour(Playback.currentSong).then(c => colour = c)
    })

    $effect(() => {
        if (!colour) {
            return
        }
        const hsl = colour.hsl()
        topColour = `hsl(${hsl.h}, ${hsl.s * 2}%, ${Math.min(hsl.l * 1.2, 80)}%)`
        bottomColour = `hsl(${hsl.h}, ${hsl.s * 1.5}%, ${Math.min(hsl.l / 1.5, 40)}%)`
    })

    async function UpdateWakeLock() {
        if (!('wakeLock' in navigator)) {
            console.warn('Screen Wake Lock API not supported.');
            return
        }
        if (document.visibilityState !== 'visible') {
            return
        }

        if (fullscreen.visible) {
            if (wakeLock) {
                return
            }
            console.log("Requesting wake lock")

            wakeLock = await navigator.wakeLock.request('screen')
            wakeLock.addEventListener('release', () => {
                console.log("Wake lock released")
                wakeLock = undefined
                if (fullscreen.visible) {
                    UpdateWakeLock()
                }
            })
            console.log("Wake lock acquired")
        }
        else {
            console.log("Releasing wake lock")
            wakeLock?.release()
            wakeLock = undefined
        }
    }

    $effect(() => {
        UpdateWakeLock()
    })

    let offset = $state(0)
    let startOffset = 0

    function OnTouchStart(e: TouchEvent) {
        offset = 0
        startOffset = e.touches[0].clientY
    }
    function OnTouchMove(e: TouchEvent) {
        const y = e.touches[0].clientY
        const diff = y - startOffset

        if (diff > 20 || offset > 0) {
            offset = diff
        }
        else {
            offset = 0
        }
    }
    function OnTouchEnd() {
        if (offset > window.innerHeight * 0.1) {
            fullscreen.Hide()
        }
        offset = 0
    }
    function OnFullscreenChange() {
        if (document.fullscreenElement != fullscreenElement) {
            fullscreen.Hide()
        }
    }

    async function OnAddToPlaylistClick(e: MouseEvent) {
        if (!Playback.currentSong) {
            return
        }

        const playlist = await SelectPlaylist()
        if (!playlist) {
            return
        }

        try {
            await PlaylistProvider.AddSongsToPlaylist(playlist.id, [Playback.currentSong.id])
        } catch (e) {
            console.error(e)
        }
    }

    function ShowContextMenu(event: MouseEvent|TouchEvent) {
        if (!Playback.currentSong) {
            return   
        }
        const options = CreateSongContextMenu(Playback.currentSong)

        const x = event instanceof MouseEvent ? event.clientX : event.changedTouches[0].clientX
        const y = event instanceof MouseEvent ? event.clientY : event.changedTouches[0].clientY

        ContextMenu.Show({ options, x, y })
    }
    async function Share() {
        if (!Playback.currentSong) {
            return
        }

        const url = "https://share.swarmtunes.com/?s=" + (await ShareSongV1(Playback.currentSong.id))
        try {
            CopyToClipboard(url)
        }
        catch {
            console.error("Failed to copy link to clipboard")
        }
    }

    // svelte-ignore non_reactive_update
    let fullscreenAnchor: HTMLDivElement

    function UpdateIFrame() {
        if (!Playback.iframe) {
            return
        }
        if (!fullscreen.visible || !fullscreenAnchor) {
            Playback.iframe.style = ""
            return
        }

        const rect = fullscreenAnchor.getBoundingClientRect()
    
        Playback.iframe.style = `
            left: ${rect.left}px;
            top: ${rect.top}px;
            width: ${rect.width}px;
            height: ${rect.height}px;
            z-index: 15;
        `
    }
    $effect(() => {
        showVideo;
        UpdateIFrame()
    })

</script>

<svelte:document onfullscreenchange={OnFullscreenChange} onvisibilitychange={UpdateWakeLock}></svelte:document>
<svelte:window onresize={UpdateIFrame} />


<!-- svelte-ignore a11y_no_static_element_interactions -->
<div 
    id="fullscreen"
    class:visible={fullscreen.visible}
    class:dragging={offset > 0}
    class:video={showVideo}
    inert={!fullscreen.visible}

    style:--tc={topColour}
    style:--bc={bottomColour}
    style:--offset={`${offset}px`}

    ontouchstart={OnTouchStart}
    ontouchmove={OnTouchMove}
    ontouchend={OnTouchEnd}

    oncontextmenu={ShowContextMenu}

    bind:this={fullscreenElement}
>
    <div class="date">{Playback.currentSong?.displayDate ?? ""}</div>
    <div class="art-container">
        <div class="art">
            {#if !showVideo}
                <Cover item={Playback.currentSong} />
            {:else}
                <div class="iframe-anchor" bind:this={fullscreenAnchor}></div>
            {/if}
            {#if Playback.iframe}
                <button class="video-button icon-button" onclick={() => showVideo = !showVideo}><IconVideo size="40" /></button>
            {/if}
        </div>

        {#if !showVideo}
            <span style="font-size: medium; font-weight: bold">{Playback.currentSong?.displaySingers ?? ""}</span>
        {/if}
    </div>
    
    <div class="info-container">
        <div class="info">
            <span class="title">{Playback.currentSong?.displayTitle ?? "Title"}</span>
            <span class="artists sub-text">{Playback.currentSong?.displayArtists ?? "Artists"}</span>   
        </div>
        <button class="add-to-playlist icon-button" onclick={OnAddToPlaylistClick}><IconPlaylistAdd size="unset"/></button>
    </div>
    <Seek thinkness={10} />
    <MediaControls iconSize={40} />

    {#if window.isMobile}
        <div class="dragger" ontouchend={fullscreen.Hide}><span></span></div>
    {:else}
        <button class="close icon-button" onclick={fullscreen.Hide}><IconX size={40} /></button>
    {/if}

    {#if window.isMobile && Playback.currentSong}
        <button class="share icon-button" onclick={Share}><IconShare3 size={35} /></button>
        <button class="context-menu icon-button" onclick={ShowContextMenu}><IconDots size={35} /></button>
    {/if}
</div>

<style>
    #fullscreen :global(*) {
        color: white !important;
    }

    .share {
        position: absolute;
        top: var(--gap);
        right: var(--gap);
    }

    .context-menu {
        position: absolute;
        top: var(--gap);
        left: var(--gap);
    }

    .close {
        position: absolute;
        top: var(--gap);
        right: var(--gap);
    }
    .dragger {
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);

        padding: 12px;
    }
    .dragger span {
        display: block;
        width: 20vw;
        height: 3px;

        background-color: white;
        border-radius: 99px;
    }

    @property --tc {
        syntax: "<color>";
        inherits: false;
        initial-value: #000;
    }

    @property --bc {
        syntax: "<color>";
        inherits: false;
        initial-value: #000;
    }

    #fullscreen {
        --gap: clamp(30px, 8vw, 80px);

        position: fixed;
        inset: 0;
        z-index: 10;

        display: grid;
        padding: var(--gap);
        gap: var(--gap);

        background: linear-gradient(to bottom right, var(--tc), var(--bc));

        transform: translateY(100%);
        transition: --tc 1s ease, --bc 1s ease, transform 0.2s ease;
        
        grid-template-rows: auto 2fr auto 1fr;
        grid-template-columns: auto 1fr;
        grid-template-areas:
        "date date"
        "art info"
        "art controls"
        "art seek";
    }
    #fullscreen.visible {
        transform: translateY(var(--offset));
    }
    #fullscreen.visible.dragging {
        transition: --tc 1s ease, --bc 1s ease; 
    }

    .date {
        grid-area: date;

        font-size: medium; 
        font-weight: bold;
        text-align: center;
    }

    .info-container {
        grid-area: info;

        display: flex;
        flex-direction: row;

        align-items: center;

        gap: 10px;
    }
    .info-container .info {
        flex: 1;

        display: flex;
        flex-direction: column;

        justify-content: center;
        text-align: center;
        white-space: pre-wrap;

        gap: 5px;
    }
    .info-container .title {
        font-size: xx-large;
        font-weight: 900;
    }
    .info-container .artists {
        font-size: large;
        font-weight: bold;
    }

    .add-to-playlist {
        display: none;
        max-width: 50px;
    }

    .art-container {
        grid-area: art;
        
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        gap: 20px;
    }
    .art {
        position: relative;
    }
    .art .iframe-anchor {
        aspect-ratio: 16/9;
        width: auto;
        max-width: 90vw;
        height: 60vh;
        background-color: var(--cover-background);
        border-radius: 10px;
    }

    .art > :global(.cover){
        width: min(40vw, 80dvh - var(--gap));
    }
    .video-button {
        position: absolute;
        bottom: 2%;
        right: 2%;
        z-index: 20;
    }

    #fullscreen > :global(.seek) {
        grid-area: seek;
    }
    #fullscreen > :global(.media-controls) {
        grid-area: controls;
    }

    #fullscreen.video {
        --gap: 10px;

        justify-content: center;
        grid-template-rows: auto auto 5px auto;
        grid-template-columns: min-content;
        grid-template-areas:
        "info"
        "art"
        "seek"
        "controls"
    }
    #fullscreen.video .date {
        display: none;
    }

    @media (max-width: 500px), (max-height: 500px) {
        #fullscreen {
            --gap: clamp(10px, 1dvh, 80px);
            padding: max(var(--gap), 4dvh) var(--gap);
        }

        .info-container .title {
            font-size: x-large;
        }
        .info-container .artists {
            font-size: medium;
        }
        .art-container {
            gap: 2px;
        }
    }

    @media (max-aspect-ratio: 7/5) {
        #fullscreen {
            --gap: clamp(30px, 8vmin, 80px);

            grid-template-rows: auto 1fr 1fr auto;
            grid-template-columns: auto 1fr;
            grid-template-areas:
            "date date"
            "art info"
            "art controls"
            "seek seek";
        }
    }

    @media (max-aspect-ratio: 9/10) {
        #fullscreen {
            background: linear-gradient(to bottom, var(--tc), var(--bc));

            justify-content: center;

            grid-template-rows: repeat(5, auto);
            grid-template-columns: min-content;
            grid-template-areas:
            "date"
            "art"
            "info"
            "seek"
            "controls";
        }
        #fullscreen:not(.video) {
            .add-to-playlist {
                display: block;
            }
            .info-container .info {
                text-align: left;
            }
        }
            

        .art > :global(.cover){
            width: min(45vh, 90vw);
        }
    }
</style>
