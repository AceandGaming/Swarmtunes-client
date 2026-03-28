import { UIObject } from "@ts/ui/ui"

import "@ts/ui/components/controls/seek-bar"
import type { SeekBar } from "@ts/ui/components/controls/seek-bar"
import "@ts/ui/components/controls/media-controls"
import type { MediaControls } from "@ts/ui/components/controls/media-controls"
import "@ts/ui/components/cover"
import type { Cover } from "@ts/ui/components/cover"
import "../components/svg"

import css from "@css/components/panels/current-song-bar.scss?inline"
import { PlaybackController } from "@ts/playback"
import { Metadata } from "@ts/metadata-display"

export class CurrentSongBar extends UIObject {
    private titleText!: HTMLHeadingElement
    private artistText!: HTMLHeadingElement
    private singersText!: HTMLHeadingElement
    private sourceText!: HTMLHeadingElement
    private coverImage!: Cover

    private singersWrapper!: HTMLDivElement
    private titleContainer!: HTMLDivElement
    private fullscreenButton!: HTMLButtonElement
    private seekBar!: SeekBar
    private mediaControls!: MediaControls

    private leftContent!: HTMLDivElement
    private middleContent!: HTMLDivElement
    private rightContent!: HTMLDivElement

    private isMobile: boolean = false

    private CreateCoverImage() {
        this.coverImage = document.createElement("st-cover") as Cover
    }
    private CreateSingersWrapper() {
        const wrapper = document.createElement("div")
        wrapper.classList.add("singer-wrapper")
        wrapper.textContent = "Covered By:"

        this.singersText = document.createElement("h2")
        wrapper.append(this.singersText)

        this.singersWrapper = wrapper
    }
    private CreateTitleContainer() {
        const titleContainer = document.createElement("div")
        titleContainer.classList.add("title-container")

        this.titleText = document.createElement("h1")
        this.titleText.textContent = "Title"

        this.artistText = document.createElement("h2")
        this.artistText.textContent = "Artist"

        titleContainer.append(this.titleText, this.artistText)

        this.titleContainer = titleContainer
    }
    private CreateSourceText() {
        const sourceText = document.createElement("h2")
        sourceText.classList.add("source-text")
        sourceText.textContent = ""

        this.sourceText = sourceText
    }
    private CreateFullscreenButton() {
        const svg = document.createElement("better-svg")
        svg.src = "src/assets/icons/maximize.svg"

        const fullscreenButton = document.createElement("button")
        fullscreenButton.append(svg)
        fullscreenButton.title = "Fullscreen"
        fullscreenButton.classList.add("fullscreen", "icon-button")
        ////@ts-expect-error
        //fullscreenButton.addEventListener("click", SongFullscreen.Show.bind(SongFullscreen))

        this.fullscreenButton = fullscreenButton
    }
    public Update(media: Metadata) {
        this.coverImage.src = media.coverUrl
        this.titleText.textContent = media.title
        this.artistText.textContent = media.artists.join(", ")
        this.singersText.textContent = media.singers.join(", ")
        // this.sourceText.textContent = media.audioSource
    }

    constructor() {
        super()
        const shadow = this.attachShadow({ mode: "open" })

        const style = document.createElement("style")
        style.textContent = css
        shadow.append(style)

        this.CreateCoverImage()
        this.CreateSingersWrapper()
        this.CreateTitleContainer()
        this.CreateSourceText()
        this.CreateFullscreenButton()

        this.seekBar = document.createElement("st-seek-bar") as SeekBar
        this.mediaControls = document.createElement("st-media-controls") as MediaControls
    }

    public CreateUI(isMobile: boolean) {
        const leftContent = document.createElement("div")
        leftContent.append(
            this.coverImage,
            this.singersWrapper
        )

        const middleContent = document.createElement("div")
        middleContent.append(
            this.titleContainer,
            this.seekBar,
            this.sourceText
        )

        this.mediaControls.UpdateButtons({
            shuffle: !isMobile,
            skipping: true,
            volume: !isMobile,
            addToPlaylist: isMobile
        })

        const rightContent = document.createElement("div")
        rightContent.append(
            this.mediaControls,
            this.fullscreenButton
        )

        this.leftContent?.remove()
        this.middleContent?.remove()
        this.rightContent?.remove()

        const content = document.createElement("div")
        content.classList.add("content")
        content.append(leftContent, middleContent, rightContent)

        this.shadowRoot?.append(content)

        this.leftContent = leftContent
        this.middleContent = middleContent
        this.rightContent = rightContent
    }

    public OnLayoutChange(isMobile: boolean): void | Promise<void> {
        this.CreateUI(isMobile)
    }

    public async Initialise(isMobile: boolean) {
        this.isMobile = isMobile

        PlaybackController.AddCallback("onMetadataChange", (media: Metadata) => {
            this.Update(media)
        })
    }

    connectedCallback() {
        super.connectedCallback()
        this.CreateUI(this.isMobile)
    }
}

customElements.define("st-current-song-bar", CurrentSongBar)
declare global {
    interface HTMLElementTagNameMap {
        "st-current-song-bar": CurrentSongBar
    }
}