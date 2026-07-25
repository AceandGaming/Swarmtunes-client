import { FormatTime } from "@ts/misc"
import PlaybackController from "@ts/playback"

export default class SeekBar {
    static seekbars: SeekBar[] = []

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
            startTime.classList.add("seek-time")
            startTime.textContent = "0:00"
            const endTime = document.createElement("span")
            endTime.classList.add("seek-time")
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

        const Click = (event: MouseEvent | TouchEvent) => {
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


        PlaybackController.AddCallback("timeUpdate", (current, duration) => this.OnTimeUpdate(current, duration, 0))

        SeekBar.seekbars.push(this)
    }
    OnTimeUpdate(played: number, duration: number, loaded: number) {
        this.#seekProgress.style.width = `${(played / duration) * 100}%`
        this.#seekLoaded.style.width = `${(loaded / duration) * 100}%`

        if (this.#startTime && this.#endTime) {
            played = Math.floor(played)
            duration = Math.floor(duration)
            this.#startTime.textContent = FormatTime(played)
            this.#endTime.textContent = FormatTime(played - duration)
        }
    }
    Clear() {
        this.#seekProgress.style.width = "0%"
        this.#seekLoaded.style.width = "0%"
        if (this.#startTime && this.#endTime) {
            this.#startTime.textContent = "0:00"
            this.#endTime.textContent = "0:00"
        }
    }
    OnSeek(event: MouseEvent) {
        if (!this.#dragging) {
            return
        }
        const rect = this.#seekBar.getBoundingClientRect()
        let fraction = (event.clientX - rect.left) / rect.width
        fraction = Math.min(1, Math.max(0, fraction))

        PlaybackController.SeekPercent(fraction)
    }
    OnSeekMobile(event: TouchEvent) {
        if (!this.#dragging) {
            return
        }
        const rect = this.#seekBar.getBoundingClientRect()
        let fraction = (event.touches[0].clientX - rect.left) / rect.width
        fraction = Math.min(1, Math.max(0, fraction))

        PlaybackController.SeekPercent(fraction)
    }
    OnSeekBarMouseDown(event: MouseEvent | TouchEvent) {
        this.#dragging = true
        if (event instanceof MouseEvent) {
            this.OnSeek(event)
        }
        else if (event instanceof TouchEvent) {
            this.OnSeekMobile(event)
        }
    }
    OnSeekBarMouseUp() {
        this.#dragging = false
    }
}