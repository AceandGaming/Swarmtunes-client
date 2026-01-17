class Tab extends HTMLElement {
    private span?: HTMLSpanElement

    private text: string = ""

    public set Text(value: string) {
        this.text = value
        this.Update()
    }
    public get Text(): string {
        return this.text
    }

    connectedCallback() {
        const shadow = this.attachShadow({ mode: "open" });
        const style = document.createElement("style")
        style.textContent = `
            :host {
                flex: 0 1 120px;
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: center;
                gap: 5px;
                background-color: var(--header-tab-default);
                height: 30px;
                margin: 0 5px;
                margin-top: auto;
                border-radius: 8px 8px 0 0;
                color: var(--text-colour);
                font-weight: bold;
                cursor: pointer;
            }
        `

        shadow.append(style)

        this.span = document.createElement("span")
        shadow.append(this.span)

        this.Update()
    }
    Update() {
        if (this.span) {
            this.span.textContent = this.text
        }
    }
}

customElements.define("swarmtunes-tab", Tab)