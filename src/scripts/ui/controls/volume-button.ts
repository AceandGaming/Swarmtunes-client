import AudioPlayer from "@ts/audio"
import SwarmFM from "@ts/swarmfm"
import YoutubePlayer from "@ts/youtube"

export default class VolumeButton {
    #volumeButton
    #volumeSlider

    #sliderFocus = false
    menuOpen = false

    constructor(volumeButton: HTMLElement, volumeSlider: HTMLInputElement) {
        this.#volumeButton = volumeButton
        this.#volumeSlider = volumeSlider

        this.#volumeButton.addEventListener("click", this.OnButtonClick.bind(this))
        this.#volumeButton.addEventListener("blur", this.OnButtonLooseFocus.bind(this))
        this.#volumeSlider.addEventListener("input", this.OnSliderChange.bind(this))
        this.#volumeSlider.addEventListener("blur", this.OnSliderLooseFocus.bind(this))

        const volume = Number(localStorage.getItem("volume")) || 0.75
        // @ts-ignore
        this.#volumeSlider.value = volume
        AudioPlayer.instance.Volume = volume
        SwarmFM.instance.Volume = volume
        YoutubePlayer.instance.Volume = volume
        this.#UpdateIcon(volume)

        AudioPlayer.instance.OnVolumeUpdate(this.#UpdateIcon.bind(this))
    }
    OnButtonClick(event: any) {
        if (event.target.id === "") {
            if (this.menuOpen) {
                this.Hide()
                return
            }
        }
        this.Show()
    }
    OnButtonLooseFocus() {
        if (!this.#sliderFocus) {
            this.Hide()
        }
    }
    #UpdateIcon(volume: number) {
        const icons = this.#volumeButton.querySelectorAll("svg")
        icons.forEach(icon => {
            icon.classList.remove("active")
        })
        const fraction = Math.ceil(volume * (icons.length - 1))
        icons[fraction].classList.add("active")
        // @ts-ignore
        this.#volumeSlider.value = volume
    }
    OnSliderChange(event: any) {
        this.#sliderFocus = true
        AudioPlayer.instance.Volume = event.target.value
        SwarmFM.instance.Volume = event.target.value
        YoutubePlayer.instance.Volume = event.target.value

        this.#UpdateIcon(event.target.value)
    }
    OnSliderLooseFocus() {
        this.#sliderFocus = false
        this.Hide()
    }
    Show() {
        this.menuOpen = true
        this.#volumeSlider.blur()
        this.#volumeSlider.style.display = "flex"
        this.#volumeButton.classList.add("active")
    }
    Hide() {
        this.menuOpen = false
        this.#volumeSlider.style.display = "none"
        this.#volumeButton.classList.remove("active")
        try {
            localStorage.setItem("volume", this.#volumeSlider.value)
        } catch (e) {
            console.error(e)
        }
    }
}