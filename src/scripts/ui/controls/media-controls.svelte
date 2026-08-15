<script lang="ts">
    import PlaybackState from "@ts/playback.svelte"
    import { IconPlayerTrackNextFilled, IconPlayerTrackPrevFilled, IconPlayerPlayFilled, IconPlayerPauseFilled, IconPlaylistAdd, IconRepeat, IconArrowsShuffle } from "@tabler/icons-svelte-runes";

    let { extraButtons = true, iconSize = 24, gap = 5, class: className = "media-controls"} = $props()
    let shuffleFlipping = $state(false)

</script>

{#snippet controls()}
    <button onclick={() => PlaybackState.Previous()} class="previous icon-button"><IconPlayerTrackPrevFilled size={iconSize * 1.5}/></button>
    <button onclick={() => PlaybackState.PlayPause()} class="play-pause icon-button">
        {#if PlaybackState.playing}
            <IconPlayerPauseFilled size={iconSize * 1.5}/>
        {:else}
            <IconPlayerPlayFilled size={iconSize * 1.5}/>
        {/if}
    </button>
    <button onclick={() => PlaybackState.Next()} class="next icon-button"><IconPlayerTrackNextFilled size={iconSize * 1.5}/></button>
{/snippet}

<div 
    class={className}
    style:--size="{iconSize}px"
    style:--gap="{gap}px"
>
    {#if extraButtons}
        <button 
            class="shuffle icon-button"
            class:active={PlaybackState.shuffle}
            class:flipping={shuffleFlipping}

            onanimationend={() => shuffleFlipping = false}
            onclick={() => {
                PlaybackState.ToggleShuffle()
                shuffleFlipping = true
            }} 
        >
            <IconArrowsShuffle size={iconSize}/>
        </button>

        {@render controls()}

        <button 
            onclick={() => PlaybackState.ToggleRepeat()} 
            class="repeat icon-button"
            class:active={PlaybackState.repeat}
        >
            <IconRepeat size={iconSize}/>
        </button>
    {:else}
        {@render controls()}
    {/if}
</div>

<style>
    .media-controls {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: var(--gap);
    }
    :is(.previous, .next) {
        aspect-ratio: 3 / 2;
    }
    :is(.previous, .next) > :global(svg) {
        transform: scaleX(1.5);
    }
    .active {
        filter: drop-shadow(0 0 3px white);
        color: white;
    }
    .shuffle.flipping {
        animation: shuffle-flip 0.1s linear;
    }

    @keyframes shuffle-flip {
        0% {
            transform: scaleY(1);
        }

        50% {
            transform: scaleY(0);
        }

        100% {
            transform: scaleY(1);
        }
}
</style>