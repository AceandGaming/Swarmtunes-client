import { ReplaceEmotesOfString } from "@ts/emote"
import { LoadSVG } from "@ts/misc"
import Network from "@ts/network"
import PlaybackController from "@ts/playback"
import PlaylistManager from "@ts/playlist-manager"
import SongQueue from "@ts/song-queue"
import VolumeButton from "@ts/ui/controls/volume-button"
import { Login } from "@ts/ui/popups/login"
import SelectPlaylist from "@ts/ui/popups/select-playlist"
import ToastManager from "@ts/ui/toast-manager"

export default class MediaControls {
    static Create({ skipping = false, shuffle = false, volume = false, addToPlaylist = false, repeat = false, size = 25 }) {
        const buttons = document.createElement("div")
        buttons.classList.add("media-controls")

        let shuffleButton
        if (shuffle) {
            shuffleButton = document.createElement("button")
            shuffleButton.append(LoadSVG("/icons/shuffle.svg"))
            shuffleButton.title = "Shuffle"
            shuffleButton.classList.add("shuffle", "icon-button")
            shuffleButton.style.height = `${size}px`
            buttons.append(shuffleButton)
        }

        let previousButton
        if (skipping) {
            previousButton = document.createElement("button")
            previousButton.append(LoadSVG("/icons/track-prev.svg"))
            previousButton.title = "Previous Song"
            previousButton.classList.add("previous", "icon-button")
            previousButton.style.height = `${size}px`
            buttons.append(previousButton)
        }

        const playPauseButton = document.createElement("button")
        playPauseButton.title = "Play/Pause"
        playPauseButton.classList.add("play-pause", "icon-button")
        playPauseButton.style.height = `${size * 1.4}px`

        const playIcon = LoadSVG("/icons/play.svg")
        playIcon.classList.add("play")

        const pauseIcon = LoadSVG("/icons/pause.svg")
        pauseIcon.classList.add("pause")

        playPauseButton.append(playIcon, pauseIcon)
        buttons.append(playPauseButton)

        let nextButton
        if (skipping) {
            nextButton = document.createElement("button")
            nextButton.append(LoadSVG("/icons/track-next.svg"))
            nextButton.title = "Next Song"
            nextButton.classList.add("next", "icon-button")
            nextButton.style.height = `${size}px`
            buttons.append(nextButton)
        }

        let repeatButton
        if (repeat) {
            repeatButton = document.createElement("button")
            repeatButton.append(LoadSVG("/icons/repeat.svg"))
            repeatButton.title = "Repeat"
            repeatButton.classList.add("repeat", "icon-button")
            repeatButton.style.height = `${size}px`
            buttons.append(repeatButton)
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
                LoadSVG("/icons/volume-off.svg"),
                LoadSVG("/icons/volume-2.svg"),
                LoadSVG("/icons/volume.svg")
            )
            buttons.append(volumeControls)
            new VolumeButton(volumeControls, volumeControls.querySelector("#volume-slider") as HTMLInputElement)
        }

        function CreateAddToPlaylistButton(callback: () => void) {
            const addToPlaylistButton = document.createElement("button")
            addToPlaylistButton.append(LoadSVG("/icons/playlist-add.svg"))
            addToPlaylistButton.title = "Add to Playlist"
            addToPlaylistButton.classList.add("add-to-playlist", "icon-button")
            addToPlaylistButton.addEventListener("click", callback)
            addToPlaylistButton.style.height = `${size}px`
            return addToPlaylistButton
        }

        if (addToPlaylist) {
            if (!Network.IsLoggedIn()) {
                Login.AddLoginCallback(() => {
                    this.Create({ skipping, shuffle, volume, addToPlaylist, repeat, size })
                })
            }
            else {
                buttons.append(CreateAddToPlaylistButton(this.#OnAddToPlaylistClick.bind(this)))
            }
        }

        const elOnLeft = shuffle ? 1 : 0
        const elOnRight = (repeat ? 1 : 0) + (addToPlaylist && Network.IsLoggedIn() ? 1 : 0) + (volume ? 1 : 0)

        if (elOnLeft > elOnRight) {
            for (let i = 0; i < elOnLeft - elOnRight; i++) {
                const padding = document.createElement("div")
                padding.style.minWidth = `${size}px`
                buttons.append(padding)
            }
        }
        else if (elOnLeft < elOnRight) {
            for (let i = 0; i < elOnRight - elOnLeft; i++) {
                const padding = document.createElement("div")
                padding.style.minWidth = `${size}px`
                buttons.prepend(padding)
            }
        }

        MediaControls.Attach(previousButton, playPauseButton, nextButton, shuffleButton, repeatButton)
        return buttons
    }
    static Attach(previous?: HTMLButtonElement, pause?: HTMLButtonElement, next?: HTMLButtonElement, shuffle?: HTMLButtonElement, repeat?: HTMLButtonElement) {
        if (previous) {
            previous.addEventListener("click", this.#OnPreviousClick.bind(this))
        }
        if (pause) {
            pause.addEventListener("click", this.#OnPauseClick.bind(this))

            PlaybackController.AddCallback("playPause", (playing) => pause.classList.toggle("playing", playing))
        }
        if (next) {
            next.addEventListener("click", this.#OnNextClick.bind(this))
        }
        if (shuffle) {
            shuffle.addEventListener("click", this.#OnShuffleClick.bind(this, shuffle))
            PlaybackController.AddCallback("shuffle", (shuffling: boolean) => {
                shuffle.classList.toggle("active", shuffling)
            })
            shuffle.classList.toggle("active", PlaybackController.shuffle)
        }
        if (repeat) {
            repeat.addEventListener("click", () => PlaybackController.ToggleRepeat())
            PlaybackController.AddCallback("repeat", (repeating: boolean) => {
                repeat.classList.toggle("active", repeating)
            })
            repeat.classList.toggle("active", PlaybackController.repeat)
        }
    }
    static async #OnAddToPlaylistClick() {
        // if (!AudioPlayer.instance.HasControl) {
        //     return
        // }
        // const currentSong = PlaybackController.CurrentSong
        // if (!currentSong) {
        //     return
        // }
        // const playlistId = await SelectPlaylist.AskUser()
        // if (!playlistId) {
        //     return
        // }
        // const playlist = PlaylistManager.GetPlaylist(playlistId)
        // if (playlist.Has(currentSong.Id)) {
        //     ToastManager.Toast("Song already in playlist", "error")
        //     return
        // }
        // await playlist.GetSongs()
        // playlist.Add(currentSong)
        // ToastManager.Toast(`Added song to <b>${ReplaceEmotesOfString(playlist.Title)}</b>`, "none", 3, true)
    }
    static #OnPauseClick() {
        PlaybackController.PlayPause()
    }
    static #OnNextClick() {
        PlaybackController.Next()
    }
    static #OnPreviousClick() {
        PlaybackController.Previous()
    }
    static #OnShuffleClick(button: HTMLButtonElement) {
        button.classList.remove("flip")
        void button.offsetWidth
        button.classList.add("flip")
        button.addEventListener("animationend", () => {
            button.classList.remove("flip")
        })

        PlaybackController.ToggleShuffle()
    }
}