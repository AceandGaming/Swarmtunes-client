class Cover extends HTMLElement {
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
    #colour = null
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
        return {
            r: colour[0] as number,
            g: colour[1] as number,
            b: colour[2] as number
        }
    }
    get color() {
        return this.colour
    }
    get hsl() {
        const rgb = this.colour
        const hsl = RGBToHSL(rgb.r, rgb.g, rgb.b)
        return hsl
    }

    constructor() {
        super()
        const shadow = this.attachShadow({ mode: "open" });

        const style = document.createElement("style")
        style.textContent = `
            :host {
                display: inline-block;

                aspect-ratio: 1;

                border-radius: max(8px, 5%);
                background-color: var(--cover-background);
                overflow: hidden;
            }
            :host(.loading) {
                background:  var(--cover-background) linear-gradient(-60deg, transparent 0%, transparent 20%, #FFFFFF20 50%, transparent 80%, transparent 100%);
                background-size: 1000% 100%;
                animation: move 2s linear infinite;
            }
            canvas {
                width: 100%;
                height: 100%;
            }
            @keyframes move {
                from {
                    background-position: 0% 0%;
                }
                to {
                    background-position: 100% 100%;
                }
            }
        `
        shadow.append(style)

        const canvas = document.createElement("canvas")
        this.#canvas = canvas

        shadow.append(canvas)
    }

    connectedCallback() {
        this.classList.add("loading")
        if (!this.#src) {
            this.src = "src/assets/no-song.png"
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
            img.src = URL.createObjectURL(blob)
        })
    }
    #GetColour(): number[] {
        if (!this.#colour) {
            const mini = document.createElement('canvas')
            const ctx = mini.getContext('2d')
            if (!ctx) {
                return [0, 0, 0]
            }

            mini.width = 32
            mini.height = 32

            ctx.drawImage(this.#canvas, 0, 0, 32, 32)

            this.#colour = colourThief.getColor(mini, 5)
        }
        //@ts-ignore
        return this.#colour
    }
}
customElements.define("st-cover", Cover);