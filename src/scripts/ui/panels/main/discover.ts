import { UIObject } from "@ts/ui/ui"

import "@ts/ui/components/media-card-collection"
import type { MediaCardCollection } from "@ts/ui/components/media-card-collection"

import Network from "@ts/network/network"
import { PlaybackController } from "@ts/playback"

export class DiscoverMenu extends UIObject {
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
        const albumCollection = document.createElement("st-media-card-collection") as MediaCardCollection
        const albumText = document.createElement("h1")
        albumText.textContent = "Collections"
        albumText.classList.add("neuro-text")

        const originalCollection = document.createElement("st-media-card-collection") as MediaCardCollection
        const originalText = document.createElement("h1")
        originalText.textContent = "Originals"
        originalText.classList.add("neuro-text")

        const mashupCollection = document.createElement("st-media-card-collection") as MediaCardCollection
        const mashupText = document.createElement("h1")
        mashupText.textContent = "Mashups"
        mashupText.classList.add("neuro-text")

        this.onload

        this.cardCollections.append(albumText, albumCollection, originalText, originalCollection, mashupText, mashupCollection)


        const albumsPromise = Network.GetAllAlbums()
        const orignalsPromise = Network.GetAllSongs({ filters: ["original=true"] })
        const mashupsPromise = Network.GetAllSongs({ filters: ["title=mashup"] })

        const values = await Promise.all([albumsPromise, orignalsPromise, mashupsPromise])
        const albums = values[0]
        const orignals = values[1]
        const mashups = values[2]

        albumCollection.PopulateWithAlbums(albums)
        originalCollection.PopulateWithSongs(orignals)
        mashupCollection.PopulateWithSongs(mashups)

    }

    connectedCallback() {
        super.connectedCallback()
        this.append(this.buttons, this.cardCollections)
    }
}

customElements.define("st-discover-menu", DiscoverMenu)
declare global {
    interface HTMLElementTagNameMap {
        'st-discover-menu': DiscoverMenu;
    }
}