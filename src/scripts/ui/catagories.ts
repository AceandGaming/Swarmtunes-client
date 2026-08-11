import { ReplaceEmotesOfString } from "@ts/emote"
import PlaybackController from "@ts/playback"
import { RenamePlaylistPopup } from "@ts/ui/popups/rename-playlist"
import { PlaylistView, AlbumView } from "@ts/ui/content/media-view"
import type Cover from "@ts/ui/cover"
import type { Song } from "@ts/models/song"
import type { Collection } from "@ts/models/collection"
import type { Playlist } from "@ts/models/playlist"


function CreateCatagoryItemImage(element: HTMLElement, source: string) {
    const image = document.createElement("swarmtunes-cover") as Cover
    image.src = source

    image.GetColor().then((c) => {
        const colour = c.hsl()

        const lightness = Math.min(colour.l, 65)
        let backgroundDefault = `hsl(${colour.h} ${colour.s}% ${lightness - 5}%)`
        let backgroundHover = `hsl(${colour.h} ${colour.s}% ${lightness}%)`

        element.style.backgroundColor = backgroundDefault
        element.style.borderColor = backgroundDefault

        image.style.backgroundColor = `hsl(${colour.h} ${colour.s}% ${lightness - 20}%)`


        element.addEventListener("mouseenter", () => {
            element.style.backgroundColor = backgroundHover
            element.style.borderColor = backgroundHover
        })
        element.addEventListener("mouseleave", () => {
            element.style.backgroundColor = backgroundDefault
            element.style.borderColor = backgroundDefault
        })
    })
    return image
}
function CreateCatagoryItemElement(title: string, id: id, imageSource: string, onClickEvent: (event: any) => void, type: string, overlay = "", overlayHover = "") {
    const element = document.createElement("div")
    element.classList.add("catagory-item", type)
    element.setAttribute("data-id", id)
    element.onclick = onClickEvent
    element.setAttribute("data-category", type)

    const wrapper = document.createElement("div")
    wrapper.append(CreateCatagoryItemImage(element, imageSource))

    if (overlay) {
        const overlayContainer = document.createElement("span")
        overlayContainer.classList.add("overlay")

        const overlayElement = document.createElement("div")
        overlayElement.innerHTML = overlay
        const overlayHoverElement = document.createElement("div")
        overlayHoverElement.classList.add("hover")
        overlayHoverElement.innerHTML = overlayHover

        overlayContainer.append(overlayElement, overlayHoverElement)

        wrapper.appendChild(overlayContainer)
    }


    element.appendChild(wrapper)

    const span = document.createElement("span")
    span.innerHTML = ReplaceEmotesOfString(title)
    element.appendChild(span)

    return element
}

export abstract class Catagory {
    title: string
    items: any[]
    grid: boolean

    constructor(title: string, items: any[], grid = false) {
        this.title = title
        this.items = items
        this.grid = grid
    }
    CreateElement() {
        const element = document.createElement("div")
        element.classList.add("catagory")
        element.innerHTML = `
            <span class="title">${this.title}</span>
        `
        const wrapper = document.createElement("div")
        wrapper.classList.add("display-wrapper")
        const display = document.createElement("div")
        if (this.grid) {
            display.classList.add("grid")
        }
        display.classList.add("display")

        wrapper.appendChild(display)
        this.AddChildren(display)

        element.appendChild(wrapper)

        wrapper.addEventListener("scroll", () => {
            CheckCatagoryOverflow(element, wrapper)
        })
        setTimeout(() => {
            CheckCatagoryOverflow(element, wrapper)
        }, 200)
        return element
    }
    abstract AddChildren(display: HTMLElement): void
}
export class SongCatagory extends Catagory {
    AddChildren(display: HTMLElement) {
        for (const song of (this.items as Song[])) {
            display.appendChild(CreateCatagoryItemElement(
                song.title,
                song.id,
                song.GetArtwork(),
                () => {
                    PlaybackController.Play({
                        song: song,
                        songs: this.items
                    })
                },
                "song",
                `<img src="/icons/note.png">`,
                "Song"
            ))
        }
    }
}


export class AlbumCatagory extends Catagory {
    AddChildren(display: HTMLElement) {
        for (const album of (this.items as Collection[])) {
            display.appendChild(CreateCatagoryItemElement(
                album.title,
                album.id,
                album.GetArtwork(),
                () => AlbumView.Show(album),
                "album",
                `<img src="/icons/disc.svg">`,
                "Album"
            ))
        }
    }
}
export class PlaylistCatagory extends Catagory {
    AddChildren(display: HTMLElement) {
        for (const playlist of (this.items as Playlist[])) {
            const element = CreateCatagoryItemElement(
                playlist.title,
                playlist.id,
                playlist.GetArtwork(),
                async () => await PlaylistView.Show(playlist),
                "playlist",
                `<img src="/icons/playlist.svg">`,
                "Playlist"
            )

            const renameButton = document.createElement("button")
            renameButton.classList.add("rename-button")
            renameButton.onclick = (event) => {
                RenamePlaylistPopup.instance.Show(playlist.id)
                event.stopPropagation()
            }
            renameButton.title = "Rename Playlist"
            element.appendChild(renameButton)
            display.appendChild(element)
        }
    }
}
function ResizeGridDisplay(grid: HTMLElement) {
    if (!grid.parentElement) {
        return
    }

    const parentWidth = grid.parentElement.offsetWidth
    if (!grid.checkVisibility()) {
        return
    }
    if (parentWidth <= 0) {
        return
    }

    if (grid.children.length === 0) {
        grid.style.width = "0"
        return
    }

    const gap = parseFloat(getComputedStyle(grid).gap) || 0

    const children = grid.children as HTMLCollectionOf<HTMLElement>
    const childWdith = children[0].offsetWidth + gap
    let childrenPerRow = Math.max(Math.floor(parentWidth / childWdith), 1)
    childrenPerRow = Math.min(childrenPerRow, grid.children.length)

    const width = childrenPerRow * childWdith + gap + 2 //margin because js isn't instant
    grid.style.width = `${width}px`
}
function CheckCatagoryOverflow(catagory: HTMLElement, wrapper: HTMLElement) {
    catagory.classList.toggle("overflowing", wrapper.scrollWidth > wrapper.offsetWidth + wrapper.scrollLeft)
}
export function ResizeAllGridDisplays() {
    const grids = document.querySelectorAll(".grid") as NodeListOf<HTMLElement>
    for (const grid of grids) {
        ResizeGridDisplay(grid)
    }
}
window.addEventListener('resize', ResizeAllGridDisplays)