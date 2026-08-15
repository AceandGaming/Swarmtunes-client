import * as colourThief from 'colorthief'

export default class ColourCache {
    private static cache = new Map<string, colourThief.Color>();
    private static pending = new Map<string, Promise<colourThief.Color>>();

    static GetColour(src: string): Promise<colourThief.Color> {
        const url = new URL(src, window.location.href)
        const value = url.pathname

        if (this.cache.has(value)) {
            return Promise.resolve(this.cache.get(value)!)
        }

        if (this.pending.has(value)) {
            return this.pending.get(value)!
        }

        const promise = (async () => {
            try {
                const response = await fetch(src, {
                    method: "GET",
                    credentials: "omit"
                })
                if (!response.ok) {
                    throw new Error(`Failed to get cover ${src}`)
                }

                const blob = await response.blob()
                const bitmap = await createImageBitmap(blob, { resizeWidth: 32, resizeHeight: 32 })

                const color = await colourThief.getColor(bitmap)
                if (!color) {
                    throw new Error(`Failed to extract colour for ${src}`)
                }

                this.cache.set(value, color)
                return color
            } finally {
                this.pending.delete(value)
            }
        })()

        this.pending.set(value, promise)
        return promise
    }
}