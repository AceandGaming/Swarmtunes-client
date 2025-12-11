class SongFullscreen {
    static #element
    static #coverImage
    static #artistText
    static #titleText
    static #singersText
    static #swarmFMPanel
    static #content

    static Create() {
        const element = document.createElement("div")
        element.id = "song-fullscreen"
        const closeButton = document.createElement("button")
        closeButton.append(LoadSVG("src/assets/icons/x.svg"))
        closeButton.classList.add("close-button", "icon-button")
        closeButton.addEventListener("click", SongFullscreen.Hide.bind(SongFullscreen))
        element.appendChild(closeButton)

        const swarmFMPlayer = document.createElement("iframe")
        swarmFMPlayer.classList.add("swarmfm-player", "hidden")
        swarmFMPlayer.src = "about:blank"
        this.#swarmFMPanel = swarmFMPlayer

        const content = document.createElement("div")
        content.classList.add("content")
        const info = document.createElement("div")
        const controls = document.createElement("div")
        this.#content = content

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
            mediaControls = MediaControls.Create({ skipping: true, shuffle: true, addToPlaylist: true, size: 40, gap: 10 })
        }
        else {
            mediaControls = MediaControls.Create({ skipping: true, shuffle: true, volume: true, size: 40, gap: 10 })
        }
        controls.append(mediaControls)

        content.append(info, controls)
        element.append(content, swarmFMPlayer)
        this.#element = element
        document.querySelector("body").prepend(element)
    }
    static Hide() {
        this.#element.classList.remove("show")
        document.querySelector("main").style.display = ""
        ShowFooter()
        document.exitFullscreen()
    }
    static Show() {
        this.#element.classList.add("show")
        document.querySelector("main").style.display = "none"
        HideFooter()
        this.#element.requestFullscreen()
        document.onfullscreenchange = () => {
            if (!document.fullscreenElement) {
                this.Hide()
            }
        }
    }
    static Display(title, artist, singers, coverUrl) {
        this.#swarmFMPanel.classList.add("hidden")
        this.#content.classList.remove("hidden")

        this.#swarmFMPanel.src = "about:blank"

        this.#titleText.textContent = title
        this.#artistText.textContent = artist
        if (this.#singersText) {
            this.#singersText.textContent = singers.join("\n")
        }
        const cover = document.createElement("img")
        cover.crossOrigin = "anonymous"
        cover.src = "src/assets/no-song.png"
        cover.classList.add("cover")

        // this.#coverImage.onload = () => {
        //     const colour = colourThief.getColor(this.#coverImage)
        //     this.#element.style.background = `linear-gradient(
        //         rgba(${colour[0]}, ${colour[1]}, ${colour[2]}, 1), 
        //         rgba(${colour[0]}, ${colour[1]}, ${colour[2]}, 0.2)
        //     )`
        //     if (colour[0] > 170) {
        //         this.#artistText.style.color = "white"
        //         this.#titleText.style.color = "white"
        //         this.#singersText.style.color = "white"
        //     }
        //     else {
        //         this.#artistText.style.color = ""
        //         this.#titleText.style.color = ""
        //         this.#singersText.style.color = ""
        //     }
        // }
        this.#coverImage.src = coverUrl
    }
    static DisplaySwarmFM() {
        if (this.#swarmFMPanel.src === "about:blank") {
            this.#swarmFMPanel.src = Network.swarmFMURL + "/player/dummy-player?from=swarmtunes&offset=" + SwarmFM.TARGET_LATENCY * 1.2
        }
        this.#swarmFMPanel.classList.remove("hidden")
        this.#content.classList.add("hidden")
    }
}