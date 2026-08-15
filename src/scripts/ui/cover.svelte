<script lang="ts">
    import type { Color } from "colorthief"
    import ColourCache from "@ts/colour-cache"
    import { untrack, onMount } from 'svelte';

    interface WithCover {
        GetArtwork(size: "small" | "medium" | "large"): string
    }

    let { item, lazy = true, colour = $bindable(), loading = $bindable(true), resolution = "auto", class: className = "cover"}: {item?: WithCover, lazy?: boolean, colour?: Color, loading?: boolean, resolution?: "auto" | "small" | "medium" | "large", class?: string} = $props()

    let imageSrc = $state("/no-song.png")

    let image: HTMLImageElement

    let backgroundColour: string|undefined = $derived.by(() => {
        if (!colour) {
            return undefined
        }

        const hsl = colour.hsl()
        return `hsl(${hsl.h} ${hsl.s}% ${Math.max(hsl.l - 20, 0)}%)`
    })


    function UpdateImageSrc() {
        if (!item) {
            return
        }

        let res: "small" | "medium" | "large"
        if (resolution == "auto") {
            const rect = image.getBoundingClientRect()

            const size = Math.max(rect.width, rect.height) * window.devicePixelRatio

            if (size > 256) {
                res = "large"
            }
            else if (size > 64) {
                res = "medium"
            }
            else {
                res = "small"
            }
        }
        else {
            res = resolution
        }
        
        const src = item.GetArtwork(res)
        if (src == untrack(() => imageSrc)) {
            return
        }

        imageSrc = src
        return src
    }

    $effect(() => {
        const src = UpdateImageSrc()
        if (!src) {
            return
        }

        loading = true
        ColourCache.GetColour(src).then(c => colour = c)
    })

    function OnLoad() {
        loading = false
    }
    function OnError() {
        imageSrc = "/no-song.png"
        loading = false
    }
    function OnResize() {
        UpdateImageSrc()
    }

    onMount(() => {
        const observer = new ResizeObserver(OnResize);
        observer.observe(image);

        return () => observer.disconnect();
    })

</script>

<img 
    class={className}
    loading={lazy ? "lazy" : "eager"}
    src={imageSrc}
    alt=""

    class:loading
    style={backgroundColour ? `--cover-background: ${backgroundColour}` : ""}

    onload={OnLoad}
    onerror={OnError}

    bind:this={image}
>

<style>
    img {
        position: relative;
        aspect-ratio: 1;

        display: block;
        border-radius: max(8px, 5%);
        background-color: var(--cover-background);

        object-fit: cover;
    }
    img.loading {
        background: var(--cover-background) linear-gradient(-60deg, transparent 0%, transparent 20%, #FFFFFF20 50%, transparent 80%, transparent 100%);
        background-size: 1000% 100%;
        animation: move 2s linear infinite;
    }

    @keyframes move {
        from {
            background-position: 0% 0%;
        }

        to {
            background-position: 100% 100%;
        }
    }
</style>