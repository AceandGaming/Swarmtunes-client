class DiscoverMenu extends UIObject {
    private cardCollections: HTMLElement

    constructor() {
        super("Discover")

        const shadow = this.attachShadow({ mode: "open" });
        const style = document.createElement("style")
        style.textContent = `
            :host {
                display: flex;
                background: var(--background);
                flex-direction: column;
                gap: 5px;
            }
        `
        shadow.append(style)

        const buttons = document.createElement("div")
        buttons.classList.add("buttons")

        this.cardCollections = document.createElement("div")
        this.cardCollections.classList.add("card-collections")

        shadow.append(buttons, this.cardCollections)
    }

    async Initialise(isMobile: boolean): Promise<void> {
        const albums = await Network.GetAllAlbums()
        const orignals = await Network.GetAllSongs({ filters: ["original=true"] })
        const mashups = await Network.GetAllSongs({ filters: ["title=mashup"] })

        const albumCollection = document.createElement("swarmtunes-media-card-collection") as MediaCardCollection
        albumCollection.PopulateWithAlbums(albums)
        const originalCollection = document.createElement("swarmtunes-media-card-collection") as MediaCardCollection
        originalCollection.PopulateWithSongs(orignals)
        const mashupCollection = document.createElement("swarmtunes-media-card-collection") as MediaCardCollection
        mashupCollection.PopulateWithSongs(mashups)

        this.cardCollections.append(albumCollection, originalCollection, mashupCollection)
    }
}

window.customElements.define("swarmtunes-discover-menu", DiscoverMenu)