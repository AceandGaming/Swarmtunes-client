import AudioPlayer from "@ts/audio"
import { FormatTime } from "@ts/misc"
import { PlaybackController } from "@ts/playback"
import SwarmFM from "@ts/swarmfm"
import YoutubePlayer from "@ts/youtube"

export default class SeekBar {
    static seekbars = []

    get element() {
        return this.#element
    }
    #element
    #seekBar
    #seekProgress
    #seekLoaded
    #startTime
    #endTime
    #dragging = false

    constructor(showTime = true, seekable = true) {
        const seek = document.createElement("div")
        seek.classList.add("seek-bar-container")
        const seekBar = document.createElement("div")
        seekBar.classList.add("seek-bar")

        const loaded = document.createElement("div")
        loaded.classList.add("loaded")
        const progress = document.createElement("div")
        progress.classList.add("progress")

        seekBar.append(loaded, progress)

        if (showTime) {
            const startTime = document.createElement("span")
            startTime.class = "seek-time"
            startTime.textContent = "0:00"
            const endTime = document.createElement("span")
            endTime.class = "seek-time"
            endTime.textContent = "0:00"
            seek.append(startTime, seekBar, endTime)
            this.#startTime = startTime
            this.#endTime = endTime
        }
        else {
            seek.append(seekBar)
        }

        this.#element = seek
        this.#seekBar = seekBar
        this.#seekProgress = progress
        this.#seekLoaded = loaded

        function Click(event) {
            this.OnSeekBarMouseDown(event)
        }

        if (seekable) {
            seekBar.addEventListener("mousedown", Click.bind(this))
            seekBar.addEventListener("touchstart", Click.bind(this))
            document.addEventListener("mouseup", this.OnSeekBarMouseUp.bind(this))
            document.addEventListener("touchend", this.OnSeekBarMouseUp.bind(this))
            document.addEventListener("mousemove", this.OnSeek.bind(this))
            document.addEventListener("touchmove", this.OnSeekMobile.bind(this))
        }


        AudioPlayer.instance.OnTimeUpdate(this.OnTimeUpdate.bind(this))
        SwarmFM.instance.OnTimeUpdate(this.OnTimeUpdate.bind(this))
        YoutubePlayer.instance.OnTimeUpdate(this.OnTimeUpdate.bind(this))

        SeekBar.seekbars.push(this)
    }
    OnTimeUpdate(played, duration, loaded) {
        this.#seekProgress.style.width = `${(played / duration) * 100}%`
        this.#seekLoaded.style.width = `${(loaded / duration) * 100}%`

        if (this.#startTime) {
            this.#startTime.textContent = FormatTime(played)
            this.#endTime.textContent = FormatTime(duration)
        }
    }
    Clear() {
        this.#seekProgress.style.width = "0%"
        this.#seekLoaded.style.width = "0%"
        this.#startTime.textContent = "0:00"
        this.#endTime.textContent = "0:00"
    }
    OnSeek(event) {
        if (!this.#dragging) {
            return
        }
        const rect = this.#seekBar.getBoundingClientRect()
        let fraction = (event.clientX - rect.left) / rect.width
        fraction = Math.min(1, Math.max(0, fraction))

        const player = PlaybackController.HasControl
        if (player) {
            player.Seek(fraction)
        }
    }
    OnSeekMobile(event) {
        if (!this.#dragging) {
            return
        }
        const rect = this.#seekBar.getBoundingClientRect()
        let fraction = (event.touches[0].clientX - rect.left) / rect.width
        fraction = Math.min(1, Math.max(0, fraction))
        AudioPlayer.instance.Seek(fraction)
        YoutubePlayer.instance.Seek(fraction)
    }
    OnSeekBarMouseDown(event) {
        this.#dragging = true
        this.OnSeek(event)
    }
    OnSeekBarMouseUp(event) {
        this.#dragging = false
    }
}