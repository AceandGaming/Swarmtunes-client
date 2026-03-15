import listItemCss from "@css/components/list-item.scss?inline"
import { Cover } from "./cover"
import { UIObject } from "../ui"
import { MediaItem } from "@ts/types"
import { PrettyDate } from "@ts/utils"
import { Song } from "@ts/types"

class ListItem extends HTMLElement {
    public get Title() { return this._title }
    public get Subtitle() { return this.subtitle }
    public get Date(): Date | undefined { return this.date }
    public get CoverUrl(): string | undefined { return this.coverUrl }

    public set Title(value: string) {
        this._title = value
        this.titleElement.textContent = value
    }
    public set Subtitle(value: string) {
        this.subtitle = value
        this.subtitleElement.textContent = value
    }
    public set Date(value: Date) {
        this.date = value
        if (!value) {
            this.dateElement.style.display = "none"
        }
        else {
            this.dateElement.textContent = PrettyDate(value)
            this.dateElement.style.display = "block"
        }
    }
    public set CoverUrl(value: string) {
        this.coverUrl = value
        this.cover.src = value
    }

    private _title: string = "ERROR"
    private subtitle: string = ""
    private date?: Date
    private coverUrl?: string

    private titleElement: HTMLHeadingElement
    private subtitleElement: HTMLHeadingElement
    private dateElement: HTMLHeadingElement
    private cover: Cover

    public SetFromMedia(media: MediaItem) {
        this.Title = media.Title
        this.Date = media.Date
        this.CoverUrl = media.CoverUrl
    }

    constructor() {
        super()
        const shadow = this.attachShadow({ mode: "open" })

        const style = document.createElement("style")
        style.textContent = listItemCss
        shadow.append(style)

        this.cover = document.createElement("st-cover") as Cover


        const left = document.createElement("div")
        left.classList.add("left")

        this.titleElement = document.createElement("h1")
        this.subtitleElement = document.createElement("h2")
        left.append(this.titleElement, this.subtitleElement)


        const right = document.createElement("div")
        right.classList.add("right")

        this.dateElement = document.createElement("h2")
        right.append(this.dateElement)


        shadow.append(this.cover, left, right)
    }
}
customElements.define("st-list-item", ListItem)

abstract class List<T extends MediaItem> extends UIObject {
    protected items: T[] = []
    private itemsHolder: HTMLOListElement

    public Add(...items: T[]) {
        for (const item of items) {
            this.items.push(item)
        }
    }
    public Remove(item: T) {
        const index = this.items.indexOf(item)
        this.items.splice(index, 1)
    }
    public RemoveAt(index: number) {
        if (index < 0 || index >= this.items.length) {
            return
        }
        this.items.splice(index, 1)
    }

    protected abstract CreateUIItem(item: T): ListItem

    public Sort(func: (a: T, b: T) => number) {
        this.items.sort(func)
    }
    public SortByTitle() {
        this.Sort((a, b) => a.Title.localeCompare(b.Title))
    }

    public Update() {
        this.itemsHolder.innerHTML = ""
        for (const item of this.items) {
            const uiItem = this.CreateUIItem(item)
            this.itemsHolder.append(uiItem)
        }
    }

    public UpdateAnimated(animateTime = 300) {
        const oldBounds: { [id: string]: DOMRect } = {}
        for (const child of Array.from(this.itemsHolder.children)) {
            const id = child.getAttribute("data-id")
            if (!id) {
                console.warn("List contains item with no id", {
                    list: this,
                    item: child
                })
                continue
            }
            oldBounds[id] = child.getBoundingClientRect()
        }

        this.Update()
        if (Object.keys(oldBounds).length === 0) {
            return
        }
        if (this.items.length <= 1) {
            return
        }

        for (const element of Array.from(this.itemsHolder.children) as ListItem[]) {
            const id = element.getAttribute("data-id")
            if (!id) {
                console.warn("List contains item with no id", {
                    list: this,
                    item: element
                })
                continue
            }
            const oldBound = oldBounds[id]
            if (oldBound === undefined) {
                continue
            }
            const newBound = element.getBoundingClientRect()
            const dy = oldBound.top - newBound.top

            element.style.transform = `translate(0, ${dy}px)`
            element.style.transition = "transform 0"

            element.getBoundingClientRect() //force update. Idk browser are weird

            requestAnimationFrame(() => {
                element.style.transition = `transform ${animateTime}ms ease`
                element.style.transform = ""
            })
        }
    }

    constructor() {
        super()
        const shadow = this.attachShadow({ mode: "open" });

        const style = document.createElement("style")
        style.textContent = `
            :host {
                display: block;
                padding-bottom: 40px;
            }
        `
        shadow.append(style)

        this.itemsHolder = document.createElement("ol")
        this.itemsHolder.classList.add("items")
        shadow.append(this.itemsHolder)
    }
}

export class SongList extends List<Song> {
    protected CreateUIItem(item: Song): ListItem {
        const ui = document.createElement("st-list-item") as ListItem
        ui.SetFromMedia(item)
        ui.Subtitle = item.Artist
        return ui
    }
}
customElements.define("st-song-list", SongList)
declare global {
    interface HTMLElementTagNameMap {
        "st-song-list": SongList
    }
} 