<script lang="ts">
    import PlaybackState from "@ts/playback.svelte"
    import Seek from "@ts/ui/controls/seek.svelte"
    import MediaControls from "@ts/ui/controls/media-controls.svelte"
    import SongFullscreen from "@ts/ui/content/fullscreen.svelte.ts";
    import Cover from "@ts/ui/cover.svelte"

    let controls: HTMLDivElement

    function OnClick(event: TouchEvent) {
        if (controls.contains(event.target as Node)) {
            return
        }

        SongFullscreen.Show()
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="current-song-bar" ontouchend={OnClick} ontouchmove={OnClick} role="presentation">
    <div class="left">
        <Cover item={PlaybackState.currentSong} />
        
        <div class="info">
            <span>{PlaybackState.currentSong?.displayTitle || "Title"}</span>
            <span class="sub-text">{PlaybackState.currentSong?.displayArtists || "Artists"}</span>
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
    .current-song-bar {
        background-color: var(--colour-surface-raised);

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
        min-width: 0;
    }
    .left :global(.cover) {
        height: 100%;
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