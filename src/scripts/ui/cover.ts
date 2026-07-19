import css from "/src/styles/cover.css?inline"
import * as ColourThief from 'colorthief'

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

    #src: string = ""
    #colour: ColourThief.Color | null = null
    #canvas: HTMLCanvasElement
    #observer?: IntersectionObserver

    get src() {
        return this.#src
    }
    set src(value: string) {
        if (value === this.#src) {
            return
        }
        this.#src = value
        this.setAttribute("src", value)
        if (this.#observer) {
            this.#observer.observe(this)
        }
    }
    get colour() {
        const colour = this.#GetColour()
        return colour.rgb()
    }
    get color() {
        return this.colour
    }
    get hsl() {
        return this.#GetColour().hsl()
    }

    constructor() {
        super()
        const shadow = this.attachShadow({ mode: "open" })

        const style = document.createElement("style")
        style.textContent = css

        shadow.append(style)

        const canvas = document.createElement("canvas")
        this.#canvas = canvas

        shadow.append(canvas)
    }

    connectedCallback() {
        this.classList.add("loading")
        if (!this.#src) {
            this.src = "src/assets/images/no-song.png"
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    this.#UpdateImage()
                    observer.unobserve(this)
                }
            })
        })
        observer.observe(this)
        this.#observer = observer
    }

    #UpdateImage() {
        const canvas = this.#canvas

        const event = fetch(this.#src)
        event.then(async (response) => {
            const blob = await response.blob()

            const ctx = canvas.getContext("2d")
            if (!ctx) {
                return
            }

            const img = new Image()
            img.onload = () => {
                canvas.width = img.width
                canvas.height = img.height
                ctx.drawImage(img, 0, 0)

                this.#colour = null

                this.classList.remove("loading")
                const event = new Event("load")
                this.dispatchEvent(event)
            }
            img.onerror = () => {
                this.classList.remove("loading")

                const event = new Event("error")
                this.dispatchEvent(event)
            }
            img.src = URL.createObjectURL(blob)
        })
    }
    #GetColour(): ColourThief.Color {
        if (!this.#colour) {
            const mini = document.createElement('canvas')
            const ctx = mini.getContext('2d')
            if (!ctx) {
                throw new Error("Failed to get 2d context")
            }

            mini.width = 32
            mini.height = 32

            ctx.drawImage(this.#canvas, 0, 0, 32, 32)

            this.#colour = ColourThief.getColorSync(mini)
            if (!this.#colour) {
                throw new Error("Failed to get colour")
            }
        }
        return this.#colour
    }
}
customElements.define("swarmtunes-cover", Cover)