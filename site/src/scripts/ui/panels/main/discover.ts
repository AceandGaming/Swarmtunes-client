class DiscoverMenu extends UIObject {
    private cardCollections: HTMLElement
    private buttons: HTMLElement

    constructor() {
        super("Discover")

        this.buttons = document.createElement("div")
        this.buttons.classList.add("buttons")
        const swarmFMButton = document.createElement("button")
        swarmFMButton.classList.add("swarmfm-button")
        swarmFMButton.title = "Play SwarmFM!"
        swarmFMButton.addEventListener("click", () => {
            PlaybackController.PlaySwarmFM()
        })

        this.buttons.append(swarmFMButton)

        this.cardCollections = document.createElement("div")
        this.cardCollections.classList.add("card-collections")
    }

    async Initialise(mobileLayout: boolean): Promise<void> {
        const albums = await Network.GetAllAlbums()
        const orignals = await Network.GetAllSongs({ filters: ["original=true"] })
        const mashups = await Network.GetAllSongs({ filters: ["title=mashup"] })

        const albumCollection = document.createElement("st-media-card-collection") as MediaCardCollection
        albumCollection.PopulateWithAlbums(albums)
        const albumText = document.createElement("h1")
        albumText.textContent = "Collections"

        const originalCollection = document.createElement("st-media-card-collection") as MediaCardCollection
        originalCollection.PopulateWithSongs(orignals)
        const originalText = document.createElement("h1")
        originalText.textContent = "Originals"

        const mashupCollection = document.createElement("st-media-card-collection") as MediaCardCollection
        mashupCollection.PopulateWithSongs(mashups)
        const mashupText = document.createElement("h1")
        mashupText.textContent = "Mashups"


        this.cardCollections.append(albumText, albumCollection, originalText, originalCollection, mashupText, mashupCollection)
    }

    connectedCallback() {
        this.append(this.buttons, this.cardCollections)
    }
}

window.customElements.define("st-discover-menu", DiscoverMenu)