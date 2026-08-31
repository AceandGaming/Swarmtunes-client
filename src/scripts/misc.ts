import { quintOut } from 'svelte/easing'
import type { AnimationConfig, FlipParams } from 'svelte/animate'
import type { Song } from '@ts/models'
import ColourCache from '@ts/colour-cache'

export function flipNoScale(node: Element, { from, to }: { from: DOMRect; to: DOMRect }, params: FlipParams = {}): AnimationConfig {
    const dx = from.left - to.left
    const dy = from.top - to.top

    const d = Math.sqrt(dx * dx + dy * dy)

    return {
        delay: params.delay ?? 0,
        duration:
            typeof params.duration === 'function'
                ? params.duration(d)
                : params.duration ?? d * 120,
        easing: params.easing ?? quintOut,

        css: (t, u) => `
            transform: translate(${u * dx}px, ${u * dy}px);
        `
    }
}

export function GetKeys<T extends object>(obj: T): (keyof T)[] {
    return Object.keys(obj) as (keyof T)[]
}

export async function GetSongColour(song: Song) {
    const src = song.GetArtwork("small")
    if (!src) {
        return undefined
    }
    return await ColourCache.GetColour(src)
}