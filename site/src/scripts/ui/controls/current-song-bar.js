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
    static #CreateSeekBar(showTime = false) {
        const seek = document.createElement("div")
        seek.id = "seek-bar-container"
        let html = `
                <div id="seek-bar">
                    <div class="loaded"></div>
                    <div class="progress"></div>
                </div>`

        if (showTime) {
            html = `
                <span class="seek-time">0:00</span>`
                + html +
                `<span class="seek-time">0:00</span>`
        }

        seek.innerHTML = html
        SeekBar.Attach(seek, seek.querySelector("#seek-bar"))
        return seek
    }
    static #CreateMediaControls(includeShuffle = false, includeVolume = false) {
        const buttons = document.createElement("div")
        buttons.classList.add("media-controls")

        let shuffleButton
        if (includeShuffle) {
            shuffleButton = document.createElement("button")
            shuffleButton.append(LoadSVG("src/assets/icons/shuffle.svg"))
            shuffleButton.title = "Shuffle"
            shuffleButton.classList.add("shuffle")
            buttons.append(shuffleButton)
        }

        const previousButton = document.createElement("button")
        previousButton.append(LoadSVG("src/assets/icons/track-prev.svg"))
        previousButton.title = "Previous Song"
        previousButton.classList.add("previous")

        const playPauseButton = document.createElement("button")
        const playIcon = LoadSVG("src/assets/icons/play.svg")
        playIcon.classList.add("play")
        const pauseIcon = LoadSVG("src/assets/icons/pause.svg")
        pauseIcon.classList.add("pause")
        playPauseButton.append(playIcon, pauseIcon)
        playPauseButton.title = "Play/Pause"
        playPauseButton.classList.add("play-pause")

        const nextButton = document.createElement("button")
        nextButton.append(LoadSVG("src/assets/icons/track-next.svg"))
        nextButton.title = "Next Song"
        nextButton.classList.add("next")

        buttons.append(previousButton, playPauseButton, nextButton)

        if (includeVolume) {
            const volumeControls = document.createElement("button")
            volumeControls.title = "Volume"
            volumeControls.tabIndex = 0
            volumeControls.classList.add("volume-controls")
            volumeControls.innerHTML = `
                <input type="range" min="0" max="1" step="0.01" value="0.5" id="volume-slider">
            `
            volumeControls.append(
                LoadSVG("src/assets/icons/volume-off.svg"),
                LoadSVG("src/assets/icons/volume-2.svg"),
                LoadSVG("src/assets/icons/volume.svg")
            )
            buttons.append(volumeControls)
            VolumeButton.Attach(volumeControls, volumeControls.querySelector("#volume-slider"))
        }

        MediaControls.Attach(buttons, previousButton, playPauseButton, nextButton, shuffleButton)
        return buttons
    }

    static CreateDesktop() {
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
            this.#CreateSeekBar(true)
        )

        const rightContent = document.createElement("div")
        rightContent.append(
            this.#CreateMediaControls(true, true)
        )

        currentSongBar.append(leftContent, middleContent, rightContent)
        this.#element = currentSongBar
        document.querySelector("footer").appendChild(currentSongBar)
    }

    static CreateMobile() {
        const currentSongBar = document.createElement("div")
        currentSongBar.id = "current-song-bar"

        const leftContent = document.createElement("div")
        leftContent.append(
            this.#CreateCoverImage(),
            this.#CreateTitleContainer()
        )

        const middleContent = document.createElement("div")
        middleContent.append(
            this.#CreateSeekBar()
        )

        const rightContent = document.createElement("div")
        rightContent.append(
            this.#CreateMediaControls()
        )

        currentSongBar.append(leftContent, middleContent, rightContent)
        this.#element = currentSongBar
        document.querySelector("footer").appendChild(currentSongBar)
    }


    static UpdateRightClick(id = "") {
        if (id == "") {
            this.#element.removeAttribute("data-uuid")
            this.#element.removeAttribute("data-rightclickcategory")
            return
        }
        this.#element.setAttribute("data-uuid", id)
        this.#element.setAttribute("data-rightclickcategory", "song")
    }
    static Display(title, artist, singers, coverUrl) {
        this.UpdateRightClick()
        this.#titleText.textContent = title
        this.#artistText.textContent = artist
        if (this.#singersText) {
            this.#singersText.textContent = singers.join("\n")
        }

        this.#coverImage.src = coverUrl

        navigator.mediaSession.metadata = new MediaMetadata({
            title: title,
            artist: artist,
            album: singers.join(", "),
            artwork: [{ src: coverUrl }],
        })
    }
    static DisplaySong(song) {
        const url = Network.GetCover(song.Cover, 256)
        this.Display(song.Title, song.Artist, song.Singers, url)
        this.UpdateRightClick(song.Id)
    }
}
