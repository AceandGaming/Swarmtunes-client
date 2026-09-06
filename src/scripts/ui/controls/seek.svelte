<script lang="ts">
    import PlaybackState from "@ts/playback.svelte"

    let { showText = true, thinkness = 8, class: className = "seek" } = $props()

    let playedPercent = $derived(PlaybackState.played / PlaybackState.duration || 0)

    let bar: HTMLDivElement
    let seeking = false

    function OnSeek(event: MouseEvent | TouchEvent) {
        let x
        if (event instanceof MouseEvent) {
            x = event.clientX
        }
        else if (event instanceof TouchEvent) {
            x = event.changedTouches[0].clientX
        }
        else {
            return
        }
        const rect = bar.getBoundingClientRect()
        
        let fraction = (x - rect.left) / rect.width
        fraction = Math.min(1, Math.max(0, fraction))

        PlaybackState.SeekPercent(fraction)
    }
    function FormatTime(seconds: number) {
        if (!isFinite(seconds)) {
            return "0:00"
        }
        const absSeconds = Math.abs(seconds)

        const minutes = Math.floor(absSeconds / 60)
        const secs = Math.floor(absSeconds % 60).toString().padStart(2, '0')
        return `${seconds < 0 ? "-" : ""}${minutes}:${secs}`
    }
</script>
<svelte:document
    onmousemove={(e) => {
        if (seeking) {
            OnSeek(e)
        }
    }}
    onmouseup={() => {
        seeking = false
    }}

    ontouchmove={(e) => {
        if (seeking) {
            OnSeek(e)
        }
    }}
    ontouchend={() => {
        seeking = false
    }}
></svelte:document>

<div 
    class={className}
    style:--played={`${(playedPercent * 100)}%`}
    style:--thinkness={`${thinkness}px`}
>
    {#if showText }
        <div class="time sub-text">{FormatTime(PlaybackState.played)}</div>
    {/if}
    <div 
        class="bar"
        bind:this={bar}
        onmousedown={(e) => {
            seeking = true
            OnSeek(e)
        }}
        ontouchstart={(e) => {
            seeking = true
            OnSeek(e)
        }}

        role="slider"
        aria-valuenow="{playedPercent * 100}"
        tabindex="0"
    >
    </div>
    {#if showText }
        <div class="time sub-text">{FormatTime(PlaybackState.played - Math.floor(PlaybackState.duration))}</div>
    {/if}
    
</div>

<style>
    @property --played {
        syntax: "<percentage>";
        inherits: true;
        initial-value: 0%;
    }

    .seek {
        display: flex;
        flex-direction: row;
        align-items: center;

        gap: 5px;
    }
    .bar {
        flex: 1;
        height: var(--thinkness);
        min-width: 100px;

        background: linear-gradient(
            to right,
            var(--colour-progress) 0%,
            var(--colour-progress) var(--played),
            #00000030 var(--played),
            #00000030 100%
        );
        border-radius: 999px;

        transition: --played 0.2s ease, height 0.2s ease-in-out;
    }
    .bar:hover {
        height: calc(var(--thinkness) + 2px);
    }
    .time {
        width: 45px;
        text-align: center;
        font-size: medium;
    }
</style>