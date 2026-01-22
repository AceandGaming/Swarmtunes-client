class TabBar extends OptionSelector {
    private tabs: Tab[] = [];
    private callbacks: any[] = [];

    CallCallbacks(index: number, name: string) {
        this.callbacks.forEach(callback => callback(index, name))
    }
    SelectOption(index: number): void {
        const tab = this.tabs[index]
        if (tab === undefined) {
            return
        }
        this.tabs.forEach(tab => tab.classList.remove("selected"))
        tab.classList.add("selected")
        this.CallCallbacks(index, tab.Text)
    }
    AddOptions(options: string[]): void {
        for (const option of options) {
            const tab = document.createElement("st-tab") as Tab
            tab.Text = option
            tab.addEventListener("click", () => this.SelectOption(this.tabs.indexOf(tab)))

            this.tabs.push(tab)
            this.append(tab)
        }
    }
    AddCallback(callback: (index: number, name: string) => void): void {
        this.callbacks.push(callback)
    }
}

customElements.define("st-tab-bar", TabBar)