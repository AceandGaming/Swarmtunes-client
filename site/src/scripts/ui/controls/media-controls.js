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

        media.setActionHandler('play', () => {
            if (SwarmFM.instance.HasControl) {
                SwarmFM.instance.Play()
            }
            else if (AudioPlayer.instance.HasControl) {
                AudioPlayer.instance.Play()
            }
        })
        media.setActionHandler('pause', () => {
            if (SwarmFM.instance.HasControl) {
                SwarmFM.instance.Pause()
            }
            else if (AudioPlayer.instance.HasControl) {
                AudioPlayer.instance.Pause()
            }
        })
        media.setActionHandler('nexttrack', () => this.#OnNextClick())
        media.setActionHandler('previoustrack', () => this.#OnPreviousClick())
        media.setActionHandler('seekforward', (details) => AudioPlayer.instance.Skip(details.seekOffset))
        media.setActionHandler('seekbackward', (details) => AudioPlayer.instance.Skip(-details.seekOffset))
        media.setActionHandler('seekto', (details) => AudioPlayer.instance.Played = details.seekTime)



        this.#initialised = true
    }

    static Create(includeShuffle = true, includeVolume = true, includeAddToPlaylist = false) {
        const buttons = document.createElement("div")
        buttons.classList.add("media-controls")

        let shuffleButton
        if (includeShuffle) {
            shuffleButton = document.createElement("button")
            shuffleButton.append(LoadSVG("src/assets/icons/shuffle.svg"))
            shuffleButton.title = "Shuffle"
            shuffleButton.classList.add("shuffle", "icon-button")
            buttons.append(shuffleButton)
        }

        const previousButton = document.createElement("button")
        previousButton.append(LoadSVG("src/assets/icons/track-prev.svg"))
        previousButton.title = "Previous Song"
        previousButton.classList.add("previous", "icon-button")

        const playPauseButton = document.createElement("button")
        const playIcon = LoadSVG("src/assets/icons/play.svg")
        playIcon.classList.add("play")
        const pauseIcon = LoadSVG("src/assets/icons/pause.svg")
        pauseIcon.classList.add("pause")
        playPauseButton.append(playIcon, pauseIcon)
        playPauseButton.title = "Play/Pause"
        playPauseButton.classList.add("play-pause", "icon-button")

        const nextButton = document.createElement("button")
        nextButton.append(LoadSVG("src/assets/icons/track-next.svg"))
        nextButton.title = "Next Song"
        nextButton.classList.add("next", "icon-button")

        buttons.append(previousButton, playPauseButton, nextButton)

        if (includeVolume) {
            const volumeControls = document.createElement("button")
            volumeControls.title = "Volume"
            volumeControls.tabIndex = 0
            volumeControls.classList.add("volume-controls", "icon-button")
            volumeControls.innerHTML = `
                <input type="range" min="0" max="1" step="0.01" value="0.5" id="volume-slider">
            `
            volumeControls.append(
                LoadSVG("src/assets/icons/volume-off.svg"),
                LoadSVG("src/assets/icons/volume-2.svg"),
                LoadSVG("src/assets/icons/volume.svg")
            )
            buttons.append(volumeControls)
            new VolumeButton(volumeControls, volumeControls.querySelector("#volume-slider"))
        }

        function CreateAddToPlaylistButton(callback) {
            const addToPlaylistButton = document.createElement("button")
            addToPlaylistButton.append(LoadSVG("src/assets/icons/playlist-add.svg"))
            addToPlaylistButton.title = "Add to Playlist"
            addToPlaylistButton.classList.add("add-to-playlist", "icon-button")
            addToPlaylistButton.addEventListener("click", callback)
            return addToPlaylistButton
        }

        if (includeAddToPlaylist) {
            if (!Network.IsLoggedIn()) {
                const spacer = document.createElement("div")
                spacer.classList.add("spacer", "add-to-playlist")
                buttons.append(spacer)
                // Login.AddLoginCallback(() => {
                //     spacer.remove()
                //     const addToPlaylist = CreateAddToPlaylistButton(this.#OnAddToPlaylistClick.bind(this))
                //     buttons.append(addToPlaylist)
                // })
                return
            }
            buttons.append(CreateAddToPlaylistButton(this.#OnAddToPlaylistClick.bind(this)))
        }


        MediaControls.Attach(buttons, previousButton, playPauseButton, nextButton, shuffleButton)
        return buttons
    }
    static Attach(element, previous, pause, next, shuffle) {
        this.#element = element

        previous.addEventListener("click", this.#OnPreviousClick.bind(this))
        pause.addEventListener("click", this.#OnPauseClick.bind(this))
        next.addEventListener("click", this.#OnNextClick.bind(this))
        if (shuffle) {
            shuffle.addEventListener("click", this.#OnShuffleClick.bind(this, shuffle))
            SongQueue.OnShuffleChange((state) => {
                shuffle.classList.toggle("active", state)
            })
        }

        function UpdatePauseButton(button, state) {
            button.classList.toggle("playing", state)
        }
        AudioPlayer.instance.OnPlayPause((state) => UpdatePauseButton(pause, state))
        SwarmFM.instance.OnPlayPause((state) => UpdatePauseButton(pause, state))

        if (!this.#initialised) {
            this.#Initialise()
        }
    }
    static async #OnAddToPlaylistClick() {
        const currentSong = AudioPlayer.instance.CurrentSong
        if (!currentSong) {
            return
        }
        const playlistId = await SelectPlaylist.AskUser()
        if (!playlistId) {
            return
        }
        const playlist = PlaylistManager.GetPlaylist(playlistId)
        await playlist.GetSongs()
        playlist.Add(currentSong)
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
        if (!AudioPlayer.instance.HasControl) {
            return
        }
        SongQueue.PlayNextSong()
    }
    static #OnPreviousClick() {
        if (!AudioPlayer.instance.HasControl) {
            return
        }
        if (AudioPlayer.instance.Played > 5) {
            AudioPlayer.instance.Played = 0
            return
        }
        SongQueue.PlayPreviousSong()
    }
    static #OnShuffleClick(button) {
        button.classList.remove("flip")
        void button.offsetWidth
        button.classList.add("flip")
        button.addEventListener("animationend", () => {
            button.classList.remove("flip")
        })

        const active = !SongQueue.suffleSongs
        SongQueue.suffleSongs = active
    }
}