import css from "@css/cover.css?inline"
import ColourCache from "@ts/colour-cache"
import type { Color } from "colorthief"

export default class Cover extends HTMLElement {
    static get observedAttributes() { return ["src"] }

    attributeChangedCallback(name: any, oldValue: any, newValue: any) {
        if (oldValue === newValue) {
            return
        }

        switch (name) {
            case "src":
                this.src = newValue
        }
    }

    private img: HTMLImageElement
    private loadingOverlay: HTMLDivElement
    private scolour?: Color
    private errorCount: number = 0

    public set src(value: string) {
        if (!value) {
            return
        }

        this.UpdateImage(value)
        this.scolour = undefined
    }
    public get src() {
        return this.img.src
    }

    private set loading(state: boolean) {
        this.classList.toggle("loading", state)
    }

    constructor() {
        super()
        const shadow = this.attachShadow({ mode: "open" })

        const style = document.createElement("style")
        style.textContent = css

        shadow.append(style)

        this.img = document.createElement("img")
        this.img.classList.add("cover")
        this.img.src = "/no-song.png"
        this.img.loading = "lazy"

        this.loadingOverlay = document.createElement("div")

        shadow.append(this.img, this.loadingOverlay)
    }

    private UpdateImage(src: string) {
        this.loading = true
        this.img.src = src

        this.img.onload = () => {
            this.loading = false
            this.img.onload = null

            const event = new CustomEvent("load")
            this.dispatchEvent(event)
        }
        this.img.onerror = () => {
            this.errorCount++
            if (this.errorCount > 3) {
                console.error("Failed to load cover", src)
                this.img.src = "/no-song.png"
                this.img.onerror = null
            }
            else {
                console.warn("Failed to load cover", src)
                setTimeout(() => {
                    const url = new URL(src, window.location.href)
                    url.searchParams.set("t", Date.now().toString())
                    this.UpdateImage(url.href)
                }, 1000)
            }
        }
    }
    public async GetColor() {
        if (!this.scolour) {
            this.scolour = await ColourCache.GetColour(this.src)
        }
        return this.scolour
    }
}
customElements.define("swarmtunes-cover", Cover)