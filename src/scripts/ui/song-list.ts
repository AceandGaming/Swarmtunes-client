import { OnSongClick } from "@ts/events"
import { LoadSVG } from "@ts/misc"
import type { Song } from "@ts/models/song"
import { ContextMenu } from "@ts/ui/context-menu"
import type Cover from "@ts/ui/cover"

function CreateSongListItemElement(song: Song, onClickEvent: (song: Song) => void, showDate = false, catagory = "song", unavaliable = false) {
    const element = document.createElement("li")
    element.classList.add("song-list-item", "song")
    element.setAttribute("data-id", song.id)
    element.setAttribute("data-category", catagory)
    element.classList.toggle("unavaliable", unavaliable)
    element.addEventListener("click", () => onClickEvent(song))

    const coverImg = document.createElement('swarmtunes-cover') as Cover
    coverImg.src = song.artwork

    const titleArtist = document.createElement('div')
    titleArtist.className = 'title-artist'

    const titleSpan = document.createElement('span')
    titleSpan.textContent = song.displayTitle

    const artistSpan = document.createElement('span')
    artistSpan.className = 'sub-text'
    artistSpan.textContent = song.displayArtists

    titleArtist.append(titleSpan, artistSpan)

    element.append(coverImg, titleArtist)

    if (showDate) {
        const date = document.createElement('span')
        date.className = 'sub-text date'
        date.textContent = song.displayDate

        const tripleDot = document.createElement('button')
        tripleDot.append(LoadSVG('/icons/triple-dot.svg'))
        tripleDot.classList.add('icon-button', 'triple-dot')
        ContextMenu.AttachButton(tripleDot, element)

        element.append(date, tripleDot)
    }
    return element
}
export class SongList {
    songs: Song[]
    songOnClickEvent: (event: any) => void
    catagory: string
    showDate: boolean
    max: number
    element: HTMLUListElement

    constructor(songs: Song[], songOnClickEvent = OnSongClick, catagory = "song", showDate = true, max = -1) {
        if (songs == undefined || !Array.isArray(songs)) {
            throw new Error("songs must be an array")
        }
        this.songs = songs
        this.songOnClickEvent = songOnClickEvent
        this.catagory = catagory
        this.showDate = showDate
        this.max = max

        this.element = document.createElement("ol")
        this.element.classList.add("song-list")
    }
    SortByTitleDifference(title: string) {
        const titleLen = title.length
        this.songs.sort((a, b) => {
            const aDistance = a.title.length - titleLen
            const bDistance = b.title.length - titleLen
            return aDistance - bDistance
        })
    }
    /** @deprecated */
    CreateElement(showDate = false) {
        this.showDate = showDate
        this.Update()
        return this.element
    }
    Update() {
        this.element.style.display = ""
        this.element.innerHTML = ""
        for (const [i, song] of this.songs.entries()) {
            this.element.appendChild(CreateSongListItemElement(song, this.songOnClickEvent, this.showDate, this.catagory))
            if (this.max > 0 && i > this.max) {
                break
            }
        }
    }
    async UpdateAnimated() {
        const oldBounds: any = {}
        for (const child of this.element.children) {
            const id = child.getAttribute("data-id")
            if (!id) {
                continue
            }
            oldBounds[id] = child.getBoundingClientRect()
        }

        this.Update()
        if (oldBounds.length === 0) {
            console.warn("No old bounds")
            return
        }
        if (this.songs.length <= 1) {
            return
        }

        for (const element of (this.element.children as HTMLCollectionOf<HTMLElement>)) {
            const id = element.getAttribute("data-id")
            if (!id) {
                continue
            }

            const oldBound = oldBounds[id]
            if (oldBound === undefined) {
                //console.warn(`No old bound for ${id}`)
                continue
            }
            const newBound = element.getBoundingClientRect()
            const dy = oldBound.top - newBound.top

            element.style.transform = `translate(0, ${dy}px)`
            element.style.transition = "transform 0"

            element.getBoundingClientRect() //force update. Idk browser are weird

            requestAnimationFrame(() => {
                element.style.transition = "transform 300ms ease"
                element.style.transform = ""
            })
        }
    }
    Hide() {
        this.element.style.display = "none"
    }
    Show() {
        this.element.style.display = ""
    }
}