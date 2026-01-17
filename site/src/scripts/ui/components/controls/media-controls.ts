class MediaControls extends UIObject {
    private shuffleButton: HTMLButtonElement
    private previousButton: HTMLButtonElement
    private playPauseButton: HTMLButtonElement
    private nextButton: HTMLButtonElement
    private addToPlaylistButton: HTMLButtonElement
    private volumeButton: HTMLButtonElement

    constructor() {
        super()

        const shuffleButton = document.createElement("button")
        shuffleButton.append(LoadSVG("src/assets/icons/shuffle.svg"))
        shuffleButton.title = "Shuffle"
        this.shuffleButton = shuffleButton

        const previousButton = document.createElement("button")
        previousButton.append(LoadSVG("src/assets/icons/track-prev.svg"))
        previousButton.title = "Previous Song"
        this.previousButton = previousButton

        const playPauseButton = document.createElement("button")
        playPauseButton.append(LoadSVG("src/assets/icons/play.svg"))
        playPauseButton.append(LoadSVG("src/assets/icons/pause.svg"))
        playPauseButton.title = "Play/Pause"
        this.playPauseButton = playPauseButton

        const nextButton = document.createElement("button")
        nextButton.append(LoadSVG("src/assets/icons/track-next.svg"))
        nextButton.title = "Next Song"
        this.nextButton = nextButton

        const addToPlaylistButton = document.createElement("button")
        addToPlaylistButton.append(LoadSVG("src/assets/icons/playlist-add.svg"))
        addToPlaylistButton.title = "Add to playlist"
        this.addToPlaylistButton = addToPlaylistButton

        const volumeButton = document.createElement("button")
        volumeButton.append(LoadSVG("src/assets/icons/volume.svg"))
        volumeButton.title = "Volume"
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

customElements.define("swarmtunes-media-controls", MediaControls)