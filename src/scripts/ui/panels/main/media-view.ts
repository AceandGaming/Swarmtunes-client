import { UIObject } from "@ts/ui/ui"

import "@ts/ui/components/cover"
import type { Cover } from "@ts/ui/components/cover"

import "@ts/ui/components/list"
import type { SongList } from "@ts/ui/components/list"
import { SongsMedia } from "@ts/types"
import { PrettyDate } from "@ts/utils"

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

        const textContainer = document.createElement("div")
        textContainer.classList.add("info-text")

        this.titleText = document.createElement("h1")
        this.titleText.classList.add("title-text")

        this.subtitleText = document.createElement("h2")
        this.subtitleText.classList.add("title-text")

        this.infoText = document.createElement("h3")

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

    public Update(info: SongsMedia) {
        this.titleText.textContent = info.Title
        this.subtitleText.textContent = PrettyDate(info.Date)
        this.infoText.textContent = `DEBUG - ${info.SongIds.length} songs - ${info.Duration} seconds`
        this.coverImage.src = info.CoverUrl

        this.style.setProperty("--cover-image", `url("${info.CoverUrl}")`)

        this.songlist.Clear()
        info.GetSongs().then((songs) => {
            this.songlist.Add(...songs)
            this.songlist.Update()
        })
    }

    connectedCallback(): void {
        super.connectedCallback()
        this.append(this.fragment)
    }
}

customElements.define("st-media-view", MediaView)
declare global {
    interface HTMLElementTagNameMap {
        "st-media-view": MediaView
    }
}