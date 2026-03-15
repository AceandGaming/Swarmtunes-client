import css from "@css/components/media-card.scss?inline"
import { Cover } from "./cover"
import { MediaItem } from "@ts/types"

export class MediaCard extends HTMLElement {
    private imageSource: string
    private titleText: string
    private image: Cover
    private titleElement: HTMLHeadingElement
    private htmlContent: boolean
    public media: MediaItem | undefined

    get ImageSource() { return this.imageSource }
    get TitleText() { return this.titleText }

    set ImageSource(value: string) {
        this.imageSource = value
        this.Update()
    }
    set TitleText(value: string) {
        this.titleText = value
        this.Update()
    }
    set HTMLContent(value: boolean) {
        this.htmlContent = value
        this.Update()
    }

    public static CreateFromMedia(media: MediaItem) {
        const element = document.createElement("st-media-card") as MediaCard
        element.ImageSource = media.CoverUrl
        element.TitleText = media.Title
        element.media = media
        return element
    }

    constructor() {
        super()
        this.imageSource = ""
        this.titleText = "ERROR"
        this.htmlContent = false

        const shadow = this.attachShadow({ mode: "open" });

        const style = document.createElement("style")
        style.textContent = css
        shadow.append(style)

        this.image = document.createElement("st-cover") as Cover
        this.titleElement = document.createElement("h1")

        this.image.addEventListener("load", (event) => {
            const target = event.target as Cover
            const colour = target.hsl
            if (colour.l > 65) {
                colour.l = 65
            }

            this.style.setProperty("--colour", `hsl(${colour.h} ${colour.s}% ${colour.l}%)`)
            this.style.setProperty("--hover-colour", `hsl(${colour.h} ${colour.s}% ${colour.l + 5}%)`)
            this.style.setProperty("--cover-background", `hsl(${colour.h} ${colour.s}% ${colour.l - 10}%)`)
        })

        shadow.append(this.image, this.titleElement)
    }
    private Update() {
        this.image.src = this.imageSource
        if (this.htmlContent) {
            this.titleElement.innerHTML = this.titleText
        } else {
            this.titleElement.textContent = this.titleText
        }
    }

    connectedCallback() {
        this.Update()
    }
}

customElements.define("st-media-card", MediaCard)