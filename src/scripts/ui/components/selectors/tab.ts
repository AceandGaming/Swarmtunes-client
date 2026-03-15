import css from "@css/components/tab.scss?inline"

export class Tab extends HTMLElement {
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
        style.textContent = css

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

customElements.define("st-tab", Tab)