class PanelView extends UIObject {
    private windows: UIObject[] = []
    private selector?: OptionSelector

    public set Selector(selector: OptionSelector) {
        if (this.selector) {
            throw new Error("Selector already set")
        }
        this.selector = selector
    }

    public AddPanel(panel: UIObject) {
        if (!this.selector) {
            throw new Error("Cannot add panel. Selector not set")
        }

        this.windows.push(panel)
        this.append(panel.element)

        this.selector.AddOptions([panel.name])
    }

    connectedCallback() {
        if (!this.selector) {
            throw new Error("Selector not set")
        }
        this.selector.AddCallback((index) => {
            this.windows.forEach((window) => {
                window.Hide()
            })
            this.windows[index]?.Show()
        })

        this.selector.SelectOption(0)
    }
}

customElements.define("st-panel-view", PanelView)