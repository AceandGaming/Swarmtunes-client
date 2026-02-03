class MediaControls extends UIObject {
    private shuffleButton: HTMLButtonElement
    private previousButton: HTMLButtonElement
    private playPauseButton: HTMLButtonElement
    private nextButton: HTMLButtonElement
    private addToPlaylistButton: HTMLButtonElement
    private volumeButton: HTMLButtonElement

    private OnPauseClick() {
        PlaybackController.Playing = !PlaybackController.Playing
    }
    private OnNextClick() {
        PlaybackController.NextSong()
    }
    private OnPreviousClick() {
        PlaybackController.PreviousSong()
    }
    private OnShuffleClick() {
        this.shuffleButton.classList.remove("flip")
        this.shuffleButton.classList.add("flip")
        this.shuffleButton.onanimationend = () => {
            this.shuffleButton.classList.remove("flip")
        }

        PlaybackController.Shuffle = !PlaybackController.Shuffle
        this.shuffleButton.classList.toggle("active", PlaybackController.Shuffle)
    }

    constructor() {
        super()

        const shuffleButton = document.createElement("button")
        shuffleButton.append(LoadSVG("src/assets/icons/shuffle.svg"))
        shuffleButton.title = "Shuffle"
        shuffleButton.classList.add("shuffle", "icon-button")
        shuffleButton.addEventListener("click", this.OnShuffleClick.bind(this))
        this.shuffleButton = shuffleButton

        const previousButton = document.createElement("button")
        previousButton.append(LoadSVG("src/assets/icons/track-prev.svg"))
        previousButton.title = "Previous Song"
        previousButton.classList.add("previous", "icon-button")
        previousButton.addEventListener("click", this.OnPreviousClick.bind(this))
        this.previousButton = previousButton

        const playPauseButton = document.createElement("button")
        playPauseButton.title = "Play/Pause"
        playPauseButton.classList.add("play-pause", "icon-button")
        playPauseButton.addEventListener("click", this.OnPauseClick.bind(this))

        const play = document.createElement("better-svg") as BetterSVG
        play.src = "src/assets/icons/play.svg"
        play.classList.add("play")
        const pause = document.createElement("better-svg") as BetterSVG
        pause.src = "src/assets/icons/pause.svg"
        pause.classList.add("pause")

        playPauseButton.append(play, pause)
        this.playPauseButton = playPauseButton

        const nextButton = document.createElement("button")
        nextButton.append(LoadSVG("src/assets/icons/track-next.svg"))
        nextButton.title = "Next Song"
        nextButton.classList.add("next", "icon-button")
        nextButton.addEventListener("click", this.OnNextClick.bind(this))
        this.nextButton = nextButton

        const addToPlaylistButton = document.createElement("button")
        addToPlaylistButton.append(LoadSVG("src/assets/icons/playlist-add.svg"))
        addToPlaylistButton.title = "Add to playlist"
        addToPlaylistButton.classList.add("add-to-playlist", "icon-button")
        this.addToPlaylistButton = addToPlaylistButton

        const volumeButton = document.createElement("button")
        volumeButton.append(LoadSVG("src/assets/icons/volume.svg"))
        volumeButton.title = "Volume"
        volumeButton.classList.add("volume", "icon-button")
        this.volumeButton = volumeButton
    }

    connectedCallback() {
        PlaybackController.AddCallback("onSourceChange", (audioSource: string) => {
            const isSwarmfm = audioSource == "swarmfm"
            this.shuffleButton.disabled = isSwarmfm
            this.previousButton.disabled = isSwarmfm
            this.nextButton.disabled = isSwarmfm
            this.addToPlaylistButton.disabled = isSwarmfm
        })

        this.append(
            this.shuffleButton,
            this.previousButton,
            this.playPauseButton,
            this.nextButton,
            this.addToPlaylistButton,
            this.volumeButton
        )
    }

    UpdateButtons(visibleButtons: { shuffle: boolean, skipping: boolean, volume: boolean, addToPlaylist: boolean }) {
        this.shuffleButton.classList.toggle("hidden", !visibleButtons.shuffle)
        this.previousButton.classList.toggle("hidden", !visibleButtons.skipping)
        this.playPauseButton.classList.toggle("hidden", !visibleButtons.skipping)
        this.nextButton.classList.toggle("hidden", !visibleButtons.skipping)
        this.addToPlaylistButton.classList.toggle("hidden", !visibleButtons.addToPlaylist)
        this.volumeButton.classList.toggle("hidden", !visibleButtons.volume)
    }
}

customElements.define("st-media-controls", MediaControls)