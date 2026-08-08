<script lang="ts">
    import PlaybackState from "@ts/playback.svelte"
    import Seek from "@ts/ui/controls/seek.svelte"
    import MediaControls from "@ts/ui/controls/media-controls.svelte"
    import SongFullscreen from "@ts/ui/content/song-fullscreen";
    import "@ts/ui/cover"

    let controls: HTMLDivElement

    function OnClick(event: MouseEvent) {
        if (controls.contains(event.target as Node)) {
            return
        }

        SongFullscreen.Show()
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="current-song-bar" onclick={OnClick} role="presentation">
    <div class="left">
        <swarmtunes-cover src={PlaybackState.currentSong?.CoverUrl}></swarmtunes-cover>
        <div class="info">
            <span>{PlaybackState.currentSong?.Title || "Title"}</span>
            <span class="sub-text">{PlaybackState.currentSong?.Artist || "Artists"}</span>
        </div>
    </div>
    <div class="bottom">
        <Seek showText={false} thinkness={4} />
    </div>
    <div class="right">
        <div style="display: contents" bind:this={controls}><MediaControls extraButtons={false} iconSize={26} gap={10} /></div>
    </div>
</div>

<style>
    * {
        box-sizing: border-box;
    }
    .current-song-bar {
        --background-colour: var(--current-song-bar);

        grid-template-columns: auto max-content;
        grid-template-rows: calc(100% - 4px) 4px;

        display: grid;
        width: 100%;
        height: 60px;
    }
    .left {
        grid-column: 1;

        display: flex;
        flex-direction: row;

        padding: 2px;
        padding-right: 0;

        justify-content: left;
        align-items: center;

        gap: 5px;
    }
    .left swarmtunes-cover {
        height: 100%;
        aspect-ratio: 1;
    }
    .left .info {
        width: 80%;
    }
    .left .info > * {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .right {
        grid-column: 2;

        display: flex;
        flex-direction: row;

        padding: 2px;
        padding-left: 0;
        padding-right: 20px;

        justify-content: right;
        align-items: center;

        gap: 2px;
    }
    .bottom {
        pointer-events: none;

        grid-column: 1 / 3;
        grid-row: 2;
    }
</style>