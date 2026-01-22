class BetterSVG extends HTMLElement {
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

    get src() { return this.#src }
    set src(value) {
        this.#src = value
        this.setAttribute("src", value)
        this.Update()
    }

    private async Update() {
        if (!this.shadowRoot) {
            return
        }

        const response = await fetch(this.#src)
        if (!response.ok) {
            return
        }
        let text = await response.text()
        text = text.replace(/\swidth=\"\d+\"/g, "").replace(/\sheight=\"\d+\"/g, "").replace(/<!--[\s\S]*?-->/g, "")

        const oldsvg = this.shadowRoot.querySelector("svg")
        if (oldsvg) {
            oldsvg.outerHTML = text
        }
        else {
            this.shadowRoot.innerHTML += text
        }
    }

    connectedCallback() {
        const shadow = this.attachShadow({ mode: "open" });
        const style = document.createElement("style")
        style.textContent = `
            :host {
                display: block;
            }
            svg {
                all: inherit;
            }
        }
        `

        shadow.append(style)
        this.Update()
    }
}

customElements.define("better-svg", BetterSVG)