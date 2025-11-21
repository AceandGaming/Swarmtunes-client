class SongFullscreen {
    static #element
    static #coverImage
    static #artistText
    static #titleText
    static #singersText

    static Create() {
        const element = document.createElement("div")
        element.id = "song-fullscreen"
        const closeButton = document.createElement("button")
        closeButton.append(LoadSVG("src/assets/icons/x.svg"))
        closeButton.classList.add("close-button", "icon-button")
        closeButton.addEventListener("click", SongFullscreen.Hide.bind(SongFullscreen))
        element.appendChild(closeButton)

        const content = document.createElement("div")
        content.classList.add("content")
        const info = document.createElement("div")
        const controls = document.createElement("div")

        const coverContainer = document.createElement("div")
        coverContainer.classList.add("cover-container")

        const cover = document.createElement("img")
        cover.crossOrigin = "anonymous"
        cover.src = "src/assets/no-song.png"
        cover.classList.add("cover")

        const singer = document.createElement("h2")
        singer.classList.add("sub-text", "singer")

        this.#coverImage = cover
        this.#singersText = singer
        coverContainer.append(cover, singer)
        info.append(coverContainer)

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
        info.append(titleContainer)

        const seekBar = new SeekBar()
        controls.append(seekBar.element)
        let mediaControls
        if (isMobile) {
            mediaControls = MediaControls.Create(true, false)
            const spacer = document.createElement("div")
            spacer.style.height = "40px"
            spacer.style.width = "40px"
            mediaControls.append(spacer)
        }
        else {
            mediaControls = MediaControls.Create(true, true)
        }
        controls.append(mediaControls)

        content.append(info, controls)
        element.appendChild(content)
        this.#element = element
        document.querySelector("body").prepend(element)
    }
    static Hide() {
        this.#element.classList.remove("show")
        document.querySelector("main").style.display = ""
        ShowFooter()
    }
    static Show() {
        this.#element.classList.add("show")
        document.querySelector("main").style.display = "none"
        HideFooter()

    }
    static Display(title, artist, singers, coverUrl) {
        this.#titleText.textContent = title
        this.#artistText.textContent = artist
        if (this.#singersText) {
            this.#singersText.textContent = singers.join("\n")
        }

        this.#coverImage.onload = () => {
            const colour = colourThief.getColor(this.#coverImage)
            console.log(colour)
            this.#element.style.background = `linear-gradient(
                rgba(${colour[0]}, ${colour[1]}, ${colour[2]}, 1), 
                rgba(${colour[0]}, ${colour[1]}, ${colour[2]}, 0.2)
            )`
        }
        this.#coverImage.src = coverUrl
    }
}