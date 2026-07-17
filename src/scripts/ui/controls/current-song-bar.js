import { LoadSVG } from "@ts/misc"
import SongFullscreen from "@ts/ui/content/song-fullscreen"
import MediaControls from "@ts/ui/controls/media-controls"
import SeekBar from "@ts/ui/controls/seek-bar"
import { CreateButton } from "@ts/ui/header"

export default class CurrentSongBar {
    static #coverImage
    static #artistText
    static #titleText
    static #singersText
    static #sourceText
    static #element

    static #CreateCoverImage() {
        this.#coverImage = document.createElement("swarmtunes-cover")
        return this.#coverImage
    }
    static #CreateSingersWrapper() {
        const wrapper = document.createElement("div")
        wrapper.classList.add("singer-wrapper")
        wrapper.textContent = "Covered By:"
        this.#singersText = document.createElement("span")
        this.#singersText.classList.add("sub-text")
        wrapper.append(this.#singersText)
        return wrapper
    }
    static #CreateTitleContainer() {
        const titleContainer = document.createElement("div")
        titleContainer.classList.add("title-container")
        this.#titleText = document.createElement("span")
        this.#titleText.textContent = "Title"
        this.#artistText = document.createElement("span")
        this.#artistText.classList.add("sub-text")
        this.#artistText.textContent = "Artist"
        titleContainer.append(this.#titleText, this.#artistText)
        return titleContainer
    }
    static #CreateSourceText() {
        const sourceText = document.createElement("span")
        sourceText.classList.add("source-text", "sub-text")
        sourceText.textContent = ""
        this.#sourceText = sourceText
        return sourceText
    }

    static CreateDesktop() {
        const old = document.querySelector("#current-song-bar")
        if (old) {
            old.remove()
        }

        const currentSongBar = document.createElement("div")
        currentSongBar.id = "current-song-bar"

        const leftContent = document.createElement("div")
        leftContent.append(
            this.#CreateCoverImage(),
            this.#CreateSingersWrapper()
        )

        const middleContent = document.createElement("div")
        middleContent.append(
            this.#CreateTitleContainer(),
            new SeekBar().element
        )

        const rightContent = document.createElement("div")
        const fullscreenButton = document.createElement("button")
        fullscreenButton.append(LoadSVG("src/assets/icons/maximize.svg"))
        fullscreenButton.title = "Fullscreen"
        fullscreenButton.classList.add("fullscreen", "icon-button")
        fullscreenButton.addEventListener("click", SongFullscreen.Show.bind(SongFullscreen))
        rightContent.append(
            MediaControls.Create({ skipping: true, shuffle: true, volume: true }),
            fullscreenButton
        )

        currentSongBar.append(leftContent, middleContent, rightContent)
        this.#element = currentSongBar
        document.querySelector("footer").appendChild(currentSongBar)
    }

    static CreateMobile() {
        const old = document.querySelector("#current-song-bar")
        if (old) {
            old.remove()
        }

        const currentSongBar = document.createElement("div")
        currentSongBar.id = "current-song-bar"

        const leftContent = document.createElement("div")
        leftContent.append(
            this.#CreateCoverImage(),
            this.#CreateTitleContainer()
        )

        const middleContent = document.createElement("div")
        middleContent.append(
            new SeekBar(false, false).element
        )

        const rightContent = document.createElement("div")
        rightContent.append(
            MediaControls.Create({ skipping: true })
        )

        currentSongBar.append(leftContent, middleContent, rightContent)
        this.#element = currentSongBar
        currentSongBar.addEventListener("touchstart", e => {
            if (e.target.id === "current-song-bar") {
                SongFullscreen.Show()
            }
        })
        document.querySelector("footer").appendChild(currentSongBar)
    }


    static UpdateRightClick(id = "") {
        if (id == "") {
            this.#element.removeAttribute("data-id")
            this.#element.removeAttribute("data-rightclickcategory")
            return
        }
        this.#element.setAttribute("data-id", id)
        this.#element.setAttribute("data-rightclickcategory", "song")
    }
    static Display(title, artist, singers, coverUrl, source) {
        this.#titleText.textContent = title
        this.#artistText.textContent = artist
        if (this.#singersText) {
            this.#singersText.textContent = singers.join("\n")
        }

        this.#coverImage.src = coverUrl
        if (this.#sourceText) {
            if (source) {
                this.#sourceText.textContent = "Source: " + source
            }
            else {
                this.#sourceText.textContent = ""
            }
        }

    }
    static GetInfo() {
        return {
            title: this.#titleText.textContent,
            artist: this.#artistText.textContent,
            singers: this.#singersText?.textContent.split("\n"),
            coverUrl: this.#coverImage.src
        }
    }
}

let lastWindowWidth = window.innerWidth
window.addEventListener("resize", () => {
    if (window.innerWidth > 600 && lastWindowWidth <= 600) {
        const oldInfo = CurrentSongBar.GetInfo()
        CurrentSongBar.CreateDesktop()
        CurrentSongBar.Display(oldInfo.title, oldInfo.artist, oldInfo.singers, oldInfo.coverUrl)
        CreateButton(false)
    }
    else if (window.innerWidth <= 600 && lastWindowWidth > 600) {
        const oldInfo = CurrentSongBar.GetInfo()
        CurrentSongBar.CreateMobile()
        CurrentSongBar.Display(oldInfo.title, oldInfo.artist, oldInfo.singers, oldInfo.coverUrl)
        CreateButton(true)
    }
    lastWindowWidth = window.innerWidth
})