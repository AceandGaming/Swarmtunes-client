import { LoadSVG } from "@ts/misc"
import Network from "@ts/network"
import SwarmFM from "@ts/swarmfm"
import { ContextMenu } from "@ts/ui/context-menu"
import MediaControls from "@ts/ui/controls/media-controls"
import SeekBar from "@ts/ui/controls/seek-bar"
import { ShowFooter, UpdateThemeColor, HideFooter } from "@ts/ui/header"

export default class SongFullscreen {
    static #element
    static #coverImage
    static #artistText
    static #titleText
    static #singersText
    static #sourceText
    static #swarmFMPanel
    static #dateText
    static #infoContainer
    static #content
    static #wakeLock
    static get visable() {
        return this.#element.classList.contains("show")
    }

    static Create() {
        const element = document.createElement("div")
        element.id = "song-fullscreen"

        const closeButton = document.createElement("button")
        const desktopIcon = LoadSVG("src/assets/icons/x.svg")
        desktopIcon.classList.add("desktop")
        const mobileIcon = LoadSVG("src/assets/icons/dash.svg")
        mobileIcon.classList.add("mobile")

        closeButton.append(desktopIcon, mobileIcon)
        closeButton.classList.add("close-button", "icon-button")
        closeButton.addEventListener("mousedown", SongFullscreen.Hide.bind(SongFullscreen))
        element.appendChild(closeButton)

        const swarmFMPlayer = document.createElement("iframe")
        swarmFMPlayer.classList.add("swarmfm-player", "hidden")
        swarmFMPlayer.src = "about:blank"
        swarmFMPlayer.sandbox = "allow-scripts allow-same-origin"
        this.#swarmFMPanel = swarmFMPlayer

        const content = document.createElement("div")
        content.classList.add("content")
        const info = document.createElement("div")
        const controls = document.createElement("div")
        this.#content = content

        const date = document.createElement("h2")
        date.classList.add("sub-text", "date")
        content.append(date)
        this.#dateText = date

        const coverContainer = document.createElement("div")
        coverContainer.classList.add("cover-container")

        const cover = document.createElement("swarmtunes-cover")

        const singer = document.createElement("h2")
        singer.classList.add("sub-text", "singer")

        this.#coverImage = cover
        this.#singersText = singer
        coverContainer.append(cover, singer)
        info.append(coverContainer)

        const infoContainer = document.createElement("div")
        infoContainer.classList.add("info-container")
        this.#infoContainer = infoContainer

        const titleContainer = document.createElement("div")
        titleContainer.classList.add("title-container")

        const title = document.createElement("h1")
        title.textContent = "Title"

        const artist = document.createElement("h2")
        artist.classList.add("sub-text")
        artist.textContent = "Artist"

        this.#titleText = title
        this.#artistText = artist
        titleContainer.append(title, artist)

        const tripleDot = document.createElement("button")
        tripleDot.append(LoadSVG('src/assets/icons/triple-dot.svg'))
        tripleDot.classList.add('icon-button', 'triple-dot')
        ContextMenu.AttachButton(tripleDot, infoContainer)

        infoContainer.append(titleContainer, tripleDot)
        info.append(infoContainer)

        const seekBar = new SeekBar()
        const sourceText = document.createElement("h2")
        sourceText.classList.add("sub-text", "source-text")
        sourceText.textContent = ""
        this.#sourceText = sourceText

        let mediaControls
        if (isMobile) {
            mediaControls = MediaControls.Create({ skipping: true, shuffle: true, addToPlaylist: true, size: 40, gap: 10 })
        }
        else {
            mediaControls = MediaControls.Create({ skipping: true, shuffle: true, volume: true, size: 40, gap: 10 })
        }
        controls.append(seekBar.element, sourceText, mediaControls)

        content.append(info, controls)
        element.append(content, swarmFMPlayer)
        this.#element = element
        document.querySelector("body").prepend(element)
    }
    static Hide() {
        this.#element.classList.remove("show")
        document.querySelector("main").style.display = ""
        ShowFooter()
        //document.exitFullscreen()
        if (this.#wakeLock) {
            this.#wakeLock.release().then(() => {
                this.#wakeLock = null
            })
        }
        UpdateThemeColor()
    }
    static Show() {
        this.#element.classList.add("show")
        document.querySelector("main").style.display = "none"
        HideFooter()
        // this.#element.requestFullscreen()
        // document.onfullscreenchange = () => {
        //     if (!document.fullscreenElement) {
        //         this.Hide()
        //     }
        // }
        if (!this.#wakeLock) {
            const corr = navigator.wakeLock.request("screen")
            corr.then((lock) => {
                this.#wakeLock = lock
            })
            corr.catch((error) => {
                console.error("Failed to get wake lock", error)
            })
        }

        if (this.visable) {
            UpdateThemeColor(this.#element.dataset.colour)
        }
    }
    static Display(title, artist, singers, coverUrl, date, source) {
        this.#swarmFMPanel.classList.add("hidden")
        this.#content.classList.remove("hidden")

        this.#swarmFMPanel.src = "about:blank"

        this.#titleText.textContent = title
        this.#artistText.textContent = artist
        if (this.#singersText) {
            this.#singersText.textContent = singers.join(", ")
        }

        this.#dateText.textContent = date

        if (source) {
            this.#sourceText.textContent = "Source: " + source
        }
        else {
            this.#sourceText.textContent = ""
        }


        this.#coverImage.addEventListener("load", (event) => {
            const colour = event.target.hsl
            this.#element.style.background = `linear-gradient(
                hsl(${colour.h}, ${colour.s * 2}%, ${Math.min(colour.l * 1.2, 80)}%),
                hsl(${colour.h}, ${colour.s * 1.5}%, ${Math.min(colour.l / 1.8, 40)}%)
            )`
            this.#element.dataset.colour = `hsl(${colour.h}, ${colour.s * 2}%, ${colour.l * 1.2}%)`

            if (this.visable) {
                UpdateThemeColor(this.#element.dataset.colour)
            }
        })

        this.#coverImage.src = coverUrl
    }
    static DisplaySwarmFM() {
        this.#element.style.background = "black"
        if (this.visable) {
            UpdateThemeColor("black")
        }
        if (this.#swarmFMPanel.src === "about:blank") {
            this.#swarmFMPanel.src = Network.swarmFMURL + "/player/dummy-player?from=swarmtunes&now=" + Date.now() + "&offset=" + SwarmFM.TARGET_LATENCY
        }
        this.#element.classList.remove("high-contrast")
        this.#swarmFMPanel.classList.remove("hidden")
        this.#content.classList.add("hidden")
    }
    static UpdateContextMenuInfo(id, catagory) {
        this.#infoContainer.setAttribute("data-id", id)
        this.#infoContainer.setAttribute("data-category", catagory)
    }
}