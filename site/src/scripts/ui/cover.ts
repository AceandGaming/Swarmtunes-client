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
    #image?: HTMLImageElement
    #placeholder?: HTMLImageElement

    get src() {
        return this.#src
    }
    set src(value) {
        if (value === this.#src) {
            return
        }
        this.#src = value
        this.setAttribute("src", value)
        this.#UpdateImage()
    }
    get colour() {
        const colour = this.#GetColour()
        return {
            r: colour[0],
            g: colour[1],
            b: colour[2]
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

    connectedCallback() {
        const shadow = this.attachShadow({ mode: "open" });

        const style = document.createElement("style")
        style.textContent = `
            :host {
                position: relative;
                aspect-ratio: 1;
                border-radius: max(8px, 5%);
                background-color: var(--cover-background);
            }
            img {
                display: block;
                width: 100%;
                height: 100%;
                background-color: inherit;
                border-radius: inherit;
            }
            img.loading {
                opacity: 0;
                position: absolute;
                top: 0;
                left: 0;
            }
            img.hidden {
                display: none;
            }
        `
        shadow.append(style)

        const placeholder = document.createElement("img")
        placeholder.src = "src/assets/no-song.png"

        const image = document.createElement("img")
        image.crossOrigin = "anonymous"
        image.loading = "lazy"
        image.classList.add("loading")
        image.addEventListener("load", () => {
            const event = new Event("load")
            this.dispatchEvent(event)
        })

        this.#placeholder = placeholder
        this.#image = image

        this.#UpdateImage()

        shadow.append(placeholder, image)
    }
    #UpdateImage() {
        if (!this.#image || !this.#placeholder) {
            return
        }
        const image = this.#image
        const placeholder = this.#placeholder

        image.classList.add("loading")
        placeholder.classList.remove("hidden")

        image.onload = () => {
            image.classList.remove("loading")
            placeholder.classList.add("hidden")
        }

        let atempts = 0
        this.#image.onerror = () => setTimeout(() => {
            const hasQuery = this.#src.includes("?")
            image.src = this.#src + (hasQuery ? "&" : "?") + "retry=" + Date.now()
            if (atempts++ > 3) {
                image.src = "src/assets/no-song.png"
                console.error(`Failed to load image: "${this.#src}"`)
            }
        }, 1000)

        image.src = this.#src
        this.#colour = null
    }
    #GetColour(): number[] {
        if (!this.#colour) {
            if (!this.#image || !this.#image.complete) {
                return [0, 0, 0]
            }
            this.#colour = colourThief.getColor(this.#image, 5)
        }
        //@ts-ignore
        return this.#colour
    }
}
customElements.define("swarmtunes-cover", Cover);