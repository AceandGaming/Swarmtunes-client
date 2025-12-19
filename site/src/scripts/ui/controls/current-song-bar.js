class CurrentSongBar {
    static get SeekBar() {
        return document.querySelector("#seek-bar")
    }

    static #coverImage
    static #artistText
    static #titleText
    static #singersText
    static #element

    static #CreateCoverImage() {
        this.#coverImage = document.createElement("img")
        this.#coverImage.classList.add("cover")
        this.#coverImage.src = "src/assets/no-song.png"
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
            new SeekBar(false).element
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
        });
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
    static Display(title, artist, singers, coverUrl) {
        this.#titleText.textContent = title
        this.#artistText.textContent = artist
        if (this.#singersText) {
            this.#singersText.textContent = singers.join("\n")
        }

        this.#coverImage.src = coverUrl
    }
}

let lastWindowWidth = window.innerWidth
window.addEventListener("resize", () => {
    if (window.innerWidth > 500 && lastWindowWidth <= 500) {
        CurrentSongBar.CreateDesktop()
        CreateButton(false)
    }
    else if (window.innerWidth <= 500 && lastWindowWidth > 500) {
        CurrentSongBar.CreateMobile()
        CreateButton(true)
    }
    lastWindowWidth = window.innerWidth
})