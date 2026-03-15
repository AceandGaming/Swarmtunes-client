import { UIObject } from "@ts/ui/ui"

import "@ts/ui/components/cover"
import type { Cover } from "@ts/ui/components/cover"

import "@ts/ui/components/list"
import type { SongList } from "@ts/ui/components/list"
import Network from "@ts/network/network"

export class MediaView extends UIObject {
    name = "Media View"

    private fragment: DocumentFragment

    private titleText!: HTMLHeadingElement
    private subtitleText!: HTMLHeadingElement
    private infoText!: HTMLHeadingElement
    private songlist: SongList
    private coverImage!: Cover


    private CreateInfo() {
        const info = document.createElement("div")
        info.classList.add("info")

        this.coverImage = document.createElement("st-cover") as Cover
        this.coverImage.src = "https://api.swarmtunes.com/covers/neuro?size=512" //test

        const textContainer = document.createElement("div")
        textContainer.classList.add("info-text")

        this.titleText = document.createElement("h1")
        this.titleText.classList.add("title-text")
        this.titleText.textContent = "Neuro-sama Karaoke" //test

        this.subtitleText = document.createElement("h2")
        this.subtitleText.classList.add("title-text")
        this.subtitleText.textContent = "10th Feb 2025" //test

        this.infoText = document.createElement("h3")
        this.infoText.textContent = "COLLECTION - 19 Songs - 1h 21mins" //test

        textContainer.append(this.titleText, this.subtitleText, this.infoText)
        info.append(this.coverImage, textContainer)

        return info
    }

    constructor() {
        super()
        this.fragment = document.createDocumentFragment()

        const header = document.createElement("header")

        const info = this.CreateInfo()
        const controls = document.createElement("div")
        controls.classList.add("controls")

        header.append(info, controls)


        const content = document.createElement("main")

        const sorting = document.createElement("div")
        sorting.textContent = "Title"
        sorting.classList.add("sorting")
        this.songlist = document.createElement("st-song-list")

        content.append(sorting, this.songlist)

        this.fragment.append(header, content)
    }

    connectedCallback(): void {
        super.connectedCallback()
        this.append(this.fragment)
    }

    async Initialise(mobileLayout: boolean): Promise<void> {
        const songs = await Network.GetAllSongs()
        this.songlist.Add(...songs)
        this.songlist.Update()
    }
}

customElements.define("st-media-view", MediaView)
declare global {
    interface HTMLElementTagNameMap {
        "st-media-view": MediaView
    }
}