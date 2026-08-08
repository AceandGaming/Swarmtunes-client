import { LoadSVG } from "@ts/misc"
import PlaybackController from "@ts/playback"
import type { Song } from "@ts/types/song"
import { ContextMenu } from "@ts/ui/context-menu"
import SeekBar from "@ts/ui/controls/seek.svelte"
import MediaControls from "@ts/ui/controls/media-controls.svelte"
import { mount } from "svelte"

import type Cover from "@ts/ui/cover"
import { ShowFooter, HideFooter } from "@ts/ui/header"

export default class SongFullscreen {
    static #element: HTMLDivElement
    static #coverImage: Cover
    static #artistText: HTMLSpanElement
    static #titleText: HTMLSpanElement
    static #singersText: HTMLSpanElement
    static #dateText: HTMLSpanElement
    static #infoContainer: HTMLDivElement
    static #content: HTMLDivElement
    static #wakeLock: WakeLockSentinel | null

    static get visable() {
        return this.#element.classList.contains("show")
    }

    static Create() {
        const element = document.createElement("div")
        element.id = "song-fullscreen"

        const closeButton = document.createElement("button")
        const desktopIcon = LoadSVG("/icons/x.svg")
        desktopIcon.classList.add("desktop")
        const mobileIcon = LoadSVG("/icons/dash.svg")
        mobileIcon.classList.add("mobile")

        closeButton.append(desktopIcon, mobileIcon)
        closeButton.classList.add("close-button", "icon-button")
        closeButton.addEventListener("mousedown", SongFullscreen.Hide.bind(SongFullscreen))
        element.appendChild(closeButton)

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

        const cover = document.createElement("swarmtunes-cover") as Cover

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
        tripleDot.append(LoadSVG('/icons/triple-dot.svg'))
        tripleDot.classList.add('icon-button', 'triple-dot')
        ContextMenu.AttachButton(tripleDot, infoContainer)

        infoContainer.append(titleContainer, tripleDot)
        info.append(infoContainer)

        mount(SeekBar, { target: controls, props: { thinkness: 10 } })
        mount(MediaControls, { target: controls, props: { iconSize: 40 } })

        content.append(info, controls)
        element.append(content)
        this.#element = element
        document.querySelector("body")?.prepend(element)

        PlaybackController.AddCallback("loadedSong", (song: Song) => {
            this.Display(
                song.Title,
                song.Artist,
                song.Singers,
                song.CoverUrl,
                song.PrettyDate
            )
        })
    }
    static Hide() {
        this.#element.classList.remove("show")
        ShowFooter()
        if (this.#wakeLock) {
            this.#wakeLock.release().then(() => {
                this.#wakeLock = null
            })
        }
    }
    static Show() {
        this.#element.classList.add("show")
        HideFooter()
        if (!this.#wakeLock) {
            const corr = navigator.wakeLock.request("screen")
            corr.then((lock) => {
                this.#wakeLock = lock
            })
            corr.catch((error) => {
                console.error("Failed to get wake lock", error)
            })
        }
    }
    static Display(title: string, artist: string, singers: string[], coverUrl: string, date: string) {
        this.#content.classList.remove("hidden")

        this.#titleText.textContent = title
        this.#artistText.textContent = artist
        if (this.#singersText) {
            this.#singersText.textContent = singers.join(", ")
        }

        this.#dateText.textContent = date

        this.#coverImage.src = coverUrl

        this.#coverImage.GetColor().then((c) => {
            const colour = c.hsl()

            this.#element.style = `
                --c1: hsl(${colour.h}, ${colour.s * 2}%, ${Math.min(colour.l * 1.2, 85)}%);
                --c2: hsl(${colour.h}, ${colour.s * 1.5}%, ${Math.min(colour.l / 1.5, 40)}%);
            `
            this.#element.dataset.colour = `hsl(${colour.h}, ${colour.s}%, ${colour.l * 1.2}%)`
        })
    }
    static UpdateContextMenuInfo(id: id, catagory: string) {
        this.#infoContainer.setAttribute("data-id", id)
        this.#infoContainer.setAttribute("data-category", catagory)
    }
}