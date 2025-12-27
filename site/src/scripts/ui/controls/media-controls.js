class MediaControls {
    static #initialised = false

    static #Initialise() {
        AudioPlayer.instance.Audio.addEventListener("ended", () => PlaybackController.NextTrack())
        YoutubePlayer.instance.OnEnd(() => PlaybackController.NextTrack())
        this.#initialised = true
    }

    static Create({ skipping = false, shuffle = false, volume = false, addToPlaylist = false, size = 25, gap = 7 }) {
        const buttons = document.createElement("div")
        buttons.classList.add("media-controls")

        let shuffleButton
        if (shuffle) {
            shuffleButton = document.createElement("button")
            shuffleButton.append(LoadSVG("src/assets/icons/shuffle.svg"))
            shuffleButton.title = "Shuffle"
            shuffleButton.classList.add("shuffle", "icon-button")
            shuffleButton.style.height = `${size}px`
            buttons.append(shuffleButton)
        }

        let previousButton
        if (skipping) {
            previousButton = document.createElement("button")
            previousButton.append(LoadSVG("src/assets/icons/track-prev.svg"))
            previousButton.title = "Previous Song"
            previousButton.classList.add("previous", "icon-button")
            previousButton.style.height = `${size}px`
            buttons.append(previousButton)
        }

        const playPauseButton = document.createElement("button")
        playPauseButton.title = "Play/Pause"
        playPauseButton.classList.add("play-pause", "icon-button")
        playPauseButton.style.height = `${size * 1.4}px`

        const playIcon = LoadSVG("src/assets/icons/play.svg")
        playIcon.classList.add("play")

        const pauseIcon = LoadSVG("src/assets/icons/pause.svg")
        pauseIcon.classList.add("pause")

        playPauseButton.append(playIcon, pauseIcon)
        buttons.append(playPauseButton)

        let nextButton
        if (skipping) {
            nextButton = document.createElement("button")
            nextButton.append(LoadSVG("src/assets/icons/track-next.svg"))
            nextButton.title = "Next Song"
            nextButton.classList.add("next", "icon-button")
            nextButton.style.height = `${size}px`
            buttons.append(nextButton)
        }

        if (volume) {
            const volumeControls = document.createElement("button")
            volumeControls.title = "Volume"
            volumeControls.tabIndex = 0
            volumeControls.classList.add("volume-controls", "icon-button")
            volumeControls.innerHTML = `
                <input type="range" min="0" max="1" step="0.01" value="0.5" id="volume-slider">
            `
            volumeControls.style.height = `${size}px`
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
            addToPlaylistButton.style.height = `${size}px`
            return addToPlaylistButton
        }

        if (addToPlaylist) {
            if (!Network.IsLoggedIn()) {
                Login.AddLoginCallback(() => {
                    const addToPlaylist = CreateAddToPlaylistButton(this.#OnAddToPlaylistClick.bind(this))
                    buttons.append(addToPlaylist)
                })
            }
            else {
                buttons.append(CreateAddToPlaylistButton(this.#OnAddToPlaylistClick.bind(this)))
            }
        }

        let width = size * 1.4
        let childCount = 1
        if (skipping) {
            width += size * 2 * 2
            childCount += 2
        }
        if (shuffle) {
            width += size
            childCount++
        }
        if (volume) {
            width += size
            childCount++
        }
        if (addToPlaylist) {
            width += size
            childCount++
        }
        const lengthOdd = Math.floor(childCount / 2) * 2 + 1
        const gapEnds = gap * 1.4
        width += (buttons.children.length - 3) * gap + gapEnds * 2
        if (childCount !== lengthOdd) {
            width -= size
        }

        buttons.style.width = `${width}px`
        buttons.style.gap = `${gap}px`
        buttons.style.setProperty("--endGap", `${gapEnds}px`)

        MediaControls.Attach(previousButton, playPauseButton, nextButton, shuffleButton)
        return buttons
    }
    static Attach(previous, pause, next, shuffle, addToPlaylist) {
        if (previous) {
            previous.addEventListener("click", this.#OnPreviousClick.bind(this))
        }
        if (pause) {
            pause.addEventListener("click", this.#OnPauseClick.bind(this))
            function UpdatePauseButton(button, state) {
                button.classList.toggle("playing", state)
            }
            AudioPlayer.instance.OnPlayPause((state) => UpdatePauseButton(pause, state))
            SwarmFM.instance.OnPlayPause((state) => UpdatePauseButton(pause, state))
            YoutubePlayer.instance.OnPlayPause((state) => UpdatePauseButton(pause, state))
        }
        if (next) {
            next.addEventListener("click", this.#OnNextClick.bind(this))
        }
        if (shuffle) {
            shuffle.addEventListener("click", this.#OnShuffleClick.bind(this, shuffle))
            shuffle.classList.toggle("active", SongQueue.suffleSongs)
            SongQueue.OnShuffleChange((state) => {
                shuffle.classList.toggle("active", state)
            })
        }

        if (!this.#initialised) {
            this.#Initialise()
        }
    }
    static async #OnAddToPlaylistClick() {
        if (!AudioPlayer.instance.HasControl) {
            return
        }
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
    static #OnPauseClick() {
        if (PlaybackController.Playing) {
            PlaybackController.Pause()
        }
        else {
            PlaybackController.Play()
        }
    }
    static #OnNextClick() {
        PlaybackController.NextTrack()
    }
    static #OnPreviousClick() {
        PlaybackController.PreviousTrack()
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