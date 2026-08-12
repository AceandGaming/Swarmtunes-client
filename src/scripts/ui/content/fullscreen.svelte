<script lang="ts">
    import { IconPlaylistAdd, IconX } from "@tabler/icons-svelte-runes";
    import  Cover  from "@ts/ui/cover"
    import Seek from "@ts/ui/controls/seek.svelte";
    import MediaControls from "@ts/ui/controls/media-controls.svelte";
    import Playback from "@ts/playback.svelte"
    import fullscreen from "./fullscreen.svelte.ts"
    import { onMount } from "svelte";

    let cover: Cover

    let topColour = $state("var(--background)");
    let bottomColour = $state("var(--background)");

    let offset = $state(0)
    let startOffset = 0

    onMount(() => {
        async function OnLoad() {
            const colour = (await cover.GetColor()).hsl()

            topColour = `hsl(${colour.h}, ${colour.s * 2}%, ${Math.min(colour.l * 1.2, 80)}%)`
            bottomColour = `hsl(${colour.h}, ${colour.s * 1.5}%, ${Math.min(colour.l / 1.5, 40)}%)`
        }
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
    
        cover.addEventListener("load", OnLoad)

        window.addEventListener("touchstart", TouchStart)
        window.addEventListener("touchmove", TouchMove)
        window.addEventListener("touchend", TouchEnd)

        return () => {
            cover.removeEventListener("load", OnLoad)

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
>
    <div class="date">{Playback.currentSong?.displayDate ?? ""}</div>
    <div class="art-container">
        <swarmtunes-cover bind:this={cover} src={Playback.currentSong?.GetArtwork("large")}></swarmtunes-cover>
        
        <span style="font-size: medium; font-weight: bold">{Playback.currentSong?.displaySingers ?? ""}</span>
    </div>
    
    <div class="info-container">
        <div class="info">
            <span class="title">{Playback.currentSong?.title ?? "Title"}</span>
            <span class="artists sub-text">{Playback.currentSong?.displayArtists ?? "Artists"}</span>   
        </div>
        <button class="add-to-playlist icon-button"><IconPlaylistAdd size="unset"/></button>
    </div>
    <div class="controls">
        <Seek thinkness={10} />
        <MediaControls iconSize={40} />
    </div>

    <button class="close icon-button" onclick={fullscreen.Hide}><IconX size={40} /></button>
    <div class="dragger" ontouchend={fullscreen.Hide}><span></span></div>
</div>

<style>
    * {
        box-sizing: border-box;
    }
    :global(*) {
        color: white !important;
    }

    .close {
        position: absolute;
        top: var(--gap);
        right: var(--gap);
    }
    .dragger {
        position: absolute;
        top: var(--gap);
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
        --gap: clamp(30px, 8vmin, 80px);

        position: fixed;
        inset: 0;
        z-index: 10;

        display: grid;
        padding: var(--gap);
        gap: var(--gap);

        background: linear-gradient(to bottom right, var(--tc), var(--bc));

        transform: translateY(100vh);
        transition: --tc 1s ease, --bc 1s ease, transform 0.2s ease;
        
        grid-template-rows: auto 1fr auto;
        grid-template-columns: 1fr 1fr;
        grid-template-areas:
        "date date"
        "art info"
        "art controls";
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
    .art-container swarmtunes-cover {
        max-width: 100%;
        max-height: 100%;

        height: 100%;
    }

    .controls {
        grid-area: controls;

        display: flex;
        flex-direction: column;
        gap: var(--gap);
    }
    .controls > :global(:last-child) {
        margin: auto;
    }

    @media (max-width: 700px) or (max-height: 700px) {
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
    }

    @media (aspect-ratio < 1) {
        #fullscreen {
            padding: 8vh var(--gap);
            background: linear-gradient(to bottom, var(--tc), var(--bc));

            grid-template-rows: auto 45vh auto 1fr;
            grid-template-columns: 1fr;
            grid-template-areas:
            "date"
            "art"
            "info"
            "controls";
        }
        .info-container .info {
            text-align: left;
        }
        .add-to-playlist {
            display: block;
        }

        .art-container swarmtunes-cover {
            width: auto;
            height: 100%;
        }
    }
</style>