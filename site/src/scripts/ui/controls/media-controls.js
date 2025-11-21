class MediaControls {
    static get element() {
        return this.#element
    }
    static #element
    static #initialised = false

    static #Initialise() {
        AudioPlayer.instance.OnPlayPause(this.#OnPlayPause.bind(this))
        AudioPlayer.instance.Audio.addEventListener("ended", () => this.#OnNextClick())
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

        this.#initialised = true
    }

    static Attach(element, previous, pause, next, shuffle) {
        this.#element = element

        previous.addEventListener("click", this.#OnPreviousClick.bind(this))
        pause.addEventListener("click", this.#OnPauseClick.bind(this))
        next.addEventListener("click", this.#OnNextClick.bind(this))
        if (shuffle) {
            shuffle.addEventListener("click", this.#OnShuffleClick.bind(this, shuffle))
        }

        function UpdatePauseButton(button, state) {
            console.log(state, button)
            button.classList.toggle("playing", state)
        }
        AudioPlayer.instance.OnPlayPause((state) => UpdatePauseButton(pause, state))
        SwarmFM.instance.OnPlayPause((state) => UpdatePauseButton(pause, state))

        if (!this.#initialised) {
            this.#Initialise()
        }
    }
    static #OnPlayPause(state) {
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
    static #OnShuffleClick(button) {
        const active = !SongQueue.suffleSongs
        button.classList.toggle("active", active)

        button.classList.remove("flip")
        void button.offsetWidth
        button.classList.add("flip")

        SongQueue.suffleSongs = active
    }
}