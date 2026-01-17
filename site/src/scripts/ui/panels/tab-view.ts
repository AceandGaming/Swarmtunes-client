class TabView extends UIObject {
    private tabsContainer?: HTMLElement

    private windows: UIObject[] = []
    private tabs: Tab[] = []

    private HideAll() {
        this.windows.forEach((window) => {
            window.Hide()
        })
        this.tabs.forEach((tab) => {
            tab.classList.remove("selected")
        })
    }

    public set TabsContainer(value: HTMLElement) {
        this.tabsContainer = value
    }

    public AddPanel(panel: UIObject) {
        if (!this.tabsContainer) {
            throw new Error("Cannot add panel. Tabs container not set")
        }

        this.windows.push(panel)
        this.append(panel.element)

        const tab = document.createElement("swarmtunes-tab") as Tab
        tab.Text = panel.name
        tab.onclick = () => {
            this.HideAll()
            panel.Show()
            tab.classList.add("selected")
        }

        this.tabs.push(tab)
        this.tabsContainer.append(tab)
    }


    connectedCallback() {
        this.tabs[0]?.click()
    }
}

customElements.define("swarmtunes-tab-view", TabView)