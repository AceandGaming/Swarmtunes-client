class MediaControls {
    static PLAY_BUTTON_IMAGE = "src/assets/icons/play.svg"
    static PAUSE_BUTTON_IMAGE = "src/assets/icons/pause.svg"

    static get element() {
        return this.#element
    }
    static #previousButton;
    static #pauseButton;
    static #nextButton;
    static #shuffleButton;
    static #element

    static Attach(element, previous, pause, next, shuffle) {
        this.#element = element
        this.#previousButton = previous
        this.#pauseButton = pause
        this.#nextButton = next
        this.#shuffleButton = shuffle

        this.#previousButton.addEventListener("click", this.#OnPreviousClick.bind(this))
        this.#pauseButton.addEventListener("click", this.#OnPauseClick.bind(this))
        this.#nextButton.addEventListener("click", this.#OnNextClick.bind(this))
        if (shuffle) {
            this.#shuffleButton.addEventListener("click", this.#OnShuffleClick.bind(this))
        }

        AudioPlayer.instance.OnPlayPause(this.#OnPlayPause.bind(this))
        SwarmFM.instance.OnPlayPause(this.#OnPlayPause.bind(this))

        const media = navigator.mediaSession
        media.playbackState = "paused"
        media.onplay = () => this.#OnPlayPause(true)
        media.onpause = () => this.#OnPlayPause(false)
        media.onnexttrack = () => this.#OnNextClick()
        media.onprevioustrack = () => this.#OnPreviousClick()
        media.onseekforward = (amount) => AudioPlayer.instance.Skip(amount)
        media.onseekbackward = (amount) => AudioPlayer.instance.Skip(-amount)
        media.onseekto = (event) => AudioPlayer.instance.Played = event.seekTime
    }
    static #OnPlayPause(state) {
        if (state) {
            this.#pauseButton.src = MediaControls.PAUSE_BUTTON_IMAGE
        }
        else {
            this.#pauseButton.src = MediaControls.PLAY_BUTTON_IMAGE
        }
        navigator.mediaSession.playbackState = state ? "playing" : "paused"
    }
    static #OnPauseClick() {
        if (SwarmFM.instance.HasControl) {
            if (SwarmFM.instance.Paused) {
                SwarmFM.instance.Play()
            }
            else {
                SwarmFM.instance.Pause()
            }
        }
        else if (AudioPlayer.instance.HasControl) {
            if (AudioPlayer.instance.Paused) {
                AudioPlayer.instance.Play()
            }
            else {
                AudioPlayer.instance.Pause()
            }
        }
    }
    static #OnNextClick() {
        SongQueue.PlayNextSong()
    }
    static #OnPreviousClick() {
        SongQueue.PlayPreviousSong()
    }
    static #OnShuffleClick() {
        SongQueue.suffleSongs = !SongQueue.suffleSongs
    }
}