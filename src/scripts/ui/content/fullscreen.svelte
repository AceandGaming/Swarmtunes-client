<script lang="ts">
    import { IconPlaylistAdd, IconX } from "@tabler/icons-svelte-runes";
    import Cover from "@ts/ui/cover.svelte"
    import Seek from "@ts/ui/controls/seek.svelte";
    import MediaControls from "@ts/ui/controls/media-controls.svelte";
    import Playback from "@ts/playback.svelte"
    import fullscreen from "./fullscreen.svelte.ts"
    import { onMount } from "svelte";
    import type { Color } from "colorthief"
    
    let fullscreenElement: HTMLDivElement
    let colour: Color | undefined = $state()

    let topColour = $state("var(--background)");
    let bottomColour = $state("var(--background)");

    let wakeLock: any

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
        if (fullscreen.visible) {
            fullscreenElement.requestFullscreen()
        }
        else {
            if (document.fullscreenElement === fullscreenElement) {
                document.exitFullscreen()
            }
        }
    })

    let offset = $state(0)
    let startOffset = 0

    onMount(() => {
        function TouchStart(e: TouchEvent) {
            offset = 0
            startOffset = e.touches[0].clientY
        }
        function TouchMove(e: TouchEvent) {
            const y = e.touches[0].clientY
            const diff = y - startOffset

            if (diff > 20 || offset > 0) {
                offset = diff
            }
            else {
                offset = 0
            }
        }
        function TouchEnd() {
            if (offset > window.innerHeight * 0.1) {
                fullscreen.Hide()
            }
            offset = 0
        }
        function FullscreenChange() {
            if (document.fullscreenElement != fullscreenElement) {
                fullscreen.Hide()
            }
        }

        document.addEventListener("fullscreenchange", FullscreenChange)
        document.addEventListener("visibilitychange", UpdateWakeLock)
        window.addEventListener("touchstart", TouchStart)
        window.addEventListener("touchmove", TouchMove)
        window.addEventListener("touchend", TouchEnd)

        return () => {
            document.removeEventListener("fullscreenchange", FullscreenChange)
            document.removeEventListener("visibilitychange", UpdateWakeLock)
            window.removeEventListener("touchstart", TouchStart)
            window.removeEventListener("touchmove", TouchMove)
            window.removeEventListener("touchend", TouchEnd)
        }
    })

</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div 
    id="fullscreen"
    class:visible={fullscreen.visible}
    class:dragging={offset > 0}
    inert={!fullscreen.visible}

    style:--tc={topColour}
    style:--bc={bottomColour}
    style:--offset={`${offset}px`}

    bind:this={fullscreenElement}
>
    <div class="date">{Playback.currentSong?.displayDate ?? ""}</div>
    <div class="art-container">
        <Cover item={Playback.currentSong} bind:colour />
        
        <span style="font-size: medium; font-weight: bold">{Playback.currentSong?.displaySingers ?? ""}</span>
    </div>
    
    <div class="info-container">
        <div class="info">
            <span class="title">{Playback.currentSong?.title ?? "Title"}</span>
            <span class="artists sub-text">{Playback.currentSong?.displayArtists ?? "Artists"}</span>   
        </div>
        <button class="add-to-playlist icon-button"><IconPlaylistAdd size="unset"/></button>
    </div>
    <Seek thinkness={10} />
    <MediaControls iconSize={40} />

    <button class="close icon-button" onclick={fullscreen.Hide}><IconX size={40} /></button>
    <div class="dragger" ontouchend={fullscreen.Hide}><span></span></div>
</div>

<style>
    #fullscreen * {
        box-sizing: border-box;
    }
    #fullscreen :global(*) {
        color: white !important;
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

        display: none;
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

        transform: translateY(100vh);
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
    .art-container > :global(.cover){
        width: min(40vw, 80dvh - var(--gap));
    }

    #fullscreen > :global(.seek) {
        grid-area: seek;
    }
    #fullscreen > :global(.media-controls) {
        grid-area: controls;
    }

    @media (max-width: 500px) or (max-height: 500px) {
        #fullscreen {
            --gap: clamp(10px, 1dvh, 80px);
            padding: max(var(--gap), 4dvh) var(--gap);
        }
        .close {
            display: none;
        }
        .dragger {
            display: block;
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

    @media (aspect-ratio < 1.4) {
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

    @media (aspect-ratio < 0.9) {
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
        .info-container .info {
            text-align: left;
        }
        .add-to-playlist {
            display: block;
        }

        .art-container > :global(.cover){
            width: min(45vh, 80vw);
        }
    }
</style>