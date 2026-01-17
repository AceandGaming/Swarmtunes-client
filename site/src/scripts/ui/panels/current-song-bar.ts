class CurrentSongBar extends UIObject {
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

    CreateCoverImage() {
        this.coverImage = document.createElement("swarmtunes-cover") as Cover
    }
    CreateSingersWrapper() {
        const wrapper = document.createElement("div")
        wrapper.classList.add("singer-wrapper")
        wrapper.textContent = "Covered By:"

        this.singersText = document.createElement("h2")
        wrapper.append(this.singersText)

        this.singersWrapper = wrapper
    }
    CreateTitleContainer() {
        const titleContainer = document.createElement("div")
        titleContainer.classList.add("title-container")

        this.titleText = document.createElement("h1")
        this.titleText.textContent = "Title"

        this.artistText = document.createElement("h2")
        this.artistText.textContent = "Artist"

        titleContainer.append(this.titleText, this.artistText)

        this.titleContainer = titleContainer
    }
    CreateSourceText() {
        const sourceText = document.createElement("h2")
        sourceText.classList.add("source-text")
        sourceText.textContent = ""

        this.sourceText = sourceText
    }
    CreateFullscreenButton() {
        const fullscreenButton = document.createElement("button")
        fullscreenButton.append(LoadSVG("src/assets/icons/maximize.svg"))
        fullscreenButton.title = "Fullscreen"
        fullscreenButton.classList.add("fullscreen", "icon-button")
        ////@ts-expect-error
        //fullscreenButton.addEventListener("click", SongFullscreen.Show.bind(SongFullscreen))

        this.fullscreenButton = fullscreenButton
    }

    constructor() {
        super()

        this.CreateCoverImage()
        this.CreateSingersWrapper()
        this.CreateTitleContainer()
        this.CreateSourceText()
        this.CreateFullscreenButton()

        this.seekBar = document.createElement("swarmtunes-seek-bar") as SeekBar
        this.mediaControls = document.createElement("swarmtunes-media-controls") as MediaControls
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

        this.append(leftContent, middleContent, rightContent)

        this.leftContent = leftContent
        this.middleContent = middleContent
        this.rightContent = rightContent
    }

    public OnLayoutChange(isMobile: boolean): void | Promise<void> {
        this.CreateUI(isMobile)
    }

    public async Initialise(isMobile: boolean) {
        this.isMobile = isMobile
    }

    connectedCallback() {
        this.CreateUI(this.isMobile)
    }
}

customElements.define("swarmtunes-current-song-bar", CurrentSongBar)