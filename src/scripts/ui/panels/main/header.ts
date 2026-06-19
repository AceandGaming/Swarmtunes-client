import { UIObject } from "@ts/ui/ui";

import "@ts/ui/components/selectors/tab-bar"
import type { TabBar } from "@ts/ui/components/selectors/tab-bar";

export class Header extends UIObject {
    public get TabBar(): TabBar {
        return this.tabBar
    }
    private tabBar: TabBar
    private fragment: DocumentFragment

    constructor() {
        super()
        this.fragment = document.createDocumentFragment()

        const logoContainer = document.createElement("div")
        logoContainer.classList.add("logo-container")

        const logo = document.createElement("img")
        logo.src = "/icon.png"
        const title = document.createElement("h1")
        title.textContent = "Swarmtunes"
        title.classList.add("neuro-text")

        logoContainer.append(logo, title)
        this.fragment.append(logoContainer)

        this.tabBar = document.createElement("st-tab-bar")
        console.log(this.tabBar)
        this.fragment.append(this.tabBar)

        const account = document.createElement("div") //temp
        account.classList.add("account")
        this.fragment.append(account)
    }
    connectedCallback(): void {
        super.connectedCallback()
        this.append(this.fragment)
    }
}

customElements.define("st-header", Header)
declare global {
    interface HTMLElementTagNameMap {
        "st-header": Header
    }
}