<script lang="ts">
    import { IconMaximize } from "@tabler/icons-svelte-runes"

    import PlaybackState from "@ts/playback.svelte"
    import Seek from "@ts/ui/controls/seek.svelte"
    import MediaControls from "@ts/ui/controls/media-controls.svelte"
    import SongFullscreen from "@ts/ui/content/fullscreen.svelte.ts"
    import VolumeButton from "@ts/ui/controls/volume-button.svelte";
    import Cover from "@ts/ui/cover.svelte"
</script>

<div class="current-song-bar">
    <div class="left">
        <Cover item={PlaybackState.currentSong} />

        <div>
            <span>Covered By:</span>
            {#if (PlaybackState.currentSong)} 
                <span class="sub-text">{PlaybackState.currentSong.singers.map((singer) => singer.name).join("\n")}</span>
            {/if}
        </div>
    </div>
    <div class="center">
        <div class="info">
            <span>{PlaybackState.currentSong?.displayTitle || "Title"}</span>
            <span class="sub-text">{PlaybackState.currentSong?.displayArtists || "Artists"}</span>
        </div>
        <Seek />
    </div>
    <div class="right">
        <div class="controls">
            <MediaControls />
            <VolumeButton />
        </div>
        <button class="icon-button fullscreen" onclick={() => SongFullscreen.Show()}><IconMaximize /></button>
    </div>
</div>

<style>
    * {
        box-sizing: border-box;
    }
    .current-song-bar {
        --background-colour: var(--current-song-bar);

        display: grid;
        grid-template-columns: repeat(3, 1fr);
        width: 100%;
        height: 100px;
    }
    .current-song-bar > * {
        height: inherit;
    }
    .left {
        container-name: left;
        container-type: inline-size;

        justify-self: stretch;

        display: flex;
        flex-direction: row;

        padding: 10px;
        padding-right: 0;

        gap: 10px;
    }
    .left span:last-child {
        display: block;
        white-space: pre-line;
    }
    .left :global(.cover) {
        height: 100%;
        aspect-ratio: 1;
    }
    .center {
        justify-self: center;
        width: 100%;
        max-width: 500px;

        display: flex;
        flex-direction: column;

        justify-content: center;
        text-align: center;

        gap: 5px;
    }
    .center .info > * {
        display: block;
    }
    .right {
        justify-self: stretch;

        display: flex;
        flex-direction: row;

        padding: 10px;
        padding-left: 0;

        gap: 10px;
    }
    .right .controls {
        display: flex;
        flex: 1;

        justify-content: center;
        gap: 10px;
    }
    .right .fullscreen {
        width: 24px;
    }

    @media (max-width: 700px) {
        .current-song-bar {
            grid-template-columns: 90px auto auto;
        }
    }
    @container left (max-width: 200px) {
        .left > div {
            display: none;
        }
    }
</style>