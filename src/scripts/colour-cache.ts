import * as colourThief from 'colorthief'
import Network from "@ts/network"

export default class ColourCache {
    private static cache = new Map<string, colourThief.Color>();
    private static pending = new Map<string, Promise<colourThief.Color>>();

    static GetColour(src: string): Promise<colourThief.Color> {
        if (this.cache.has(src)) {
            return Promise.resolve(this.cache.get(src)!)
        }

        if (this.pending.has(src)) {
            return this.pending.get(src)!
        }

        const promise = (async () => {
            try {
                const response = await fetch(src)
                if (!response.ok) {
                    throw new Error(`Failed to get cover ${src}`)
                }

                const blob = await response.blob()
                const bitmap = await createImageBitmap(blob, { resizeWidth: 32, resizeHeight: 32 })

                const color = await colourThief.getColor(bitmap)
                if (!color) {
                    throw new Error(`Failed to extract colour for ${src}`)
                }

                this.cache.set(src, color)
                return color
            } finally {
                this.pending.delete(src)
            }
        })()

        this.pending.set(src, promise)
        return promise
    }
}