<script lang="ts">
    import { IconVolume, IconVolume2, IconVolumeOff } from "@tabler/icons-svelte-runes";
    import PlaybackState from "@ts/playback.svelte"

    let volumeButton: HTMLElement
    let showSlider = $state(false)
</script>

<svelte:document onmousedown={(e) => {
    if (volumeButton.contains(e.target as Node)) {
        return
    }

    showSlider = false
}}></svelte:document>

<div class="volume-button" bind:this={volumeButton} >
    <button class="icon-button" onclick={() => showSlider = !showSlider}>
        {#if PlaybackState.volume > 0.5}
            <IconVolume />
        {:else if PlaybackState.volume > 0}
            <IconVolume2 />
        {:else}
            <IconVolumeOff />
        {/if}
    </button>
    <div class:show={showSlider} class="input-wrapper">
        <input type="range" min="0" max="1" step="0.01" bind:value={PlaybackState.volume}>
    </div>
    
</div>

<style>
    .volume-button {
        position: relative;
        
        display: flex;
        justify-content: center;
        align-items: center;
    }
    button {
        height: 24px;
        aspect-ratio: 1;
    }
    .input-wrapper  {
        position: absolute;
        bottom: 90px;
        left: 50%;

        display: none;
        z-index: 1;

        transform: translateX(-50%);
    }
    .input-wrapper.show  {
        display: block;
    }
    input {
        transform: rotate(-90deg);
        width: 80px;
    }
    input{
        display: block;
    }
</style>