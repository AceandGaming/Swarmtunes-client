class VolumeButton {
    static #volumeButton
    static #volumeSlider

    static #sliderFocus = false
    static menuOpen = false

    static Attach(volumeButton, volumeSlider) {
        this.#volumeButton = volumeButton
        this.#volumeSlider = volumeSlider

        this.#volumeButton.addEventListener("click", this.OnButtonClick.bind(this))
        this.#volumeButton.addEventListener("blur", this.OnButtonLooseFocus.bind(this))
        this.#volumeSlider.addEventListener("input", this.OnSliderChange.bind(this))
        this.#volumeSlider.addEventListener("blur", this.OnSliderLooseFocus.bind(this))

        const volume = localStorage.getItem("volume") || 0.75
        this.#volumeSlider.value = volume
        AudioPlayer.instance.Volume = volume
        SwarmFM.instance.Volume = volume
        this.#UpdateIcon(volume)
    }
    static OnButtonClick(event) {
        console.log(event.target.id)
        if (event.target.id === "") {
            if (this.menuOpen) {
                this.Hide()
                return
            }
        }
        this.Show()
    }
    static OnButtonLooseFocus() {
        if (!this.#sliderFocus) {
            this.Hide()
        }
    }
    static #UpdateIcon(volume) {
        const icons = this.#volumeButton.querySelectorAll("svg")
        icons.forEach(icon => {
            icon.classList.remove("active")
        })
        const fraction = Math.ceil(volume * (icons.length - 1))
        icons[fraction].classList.add("active")
    }
    static OnSliderChange(event) {
        this.#sliderFocus = true
        AudioPlayer.instance.Volume = event.target.value
        SwarmFM.instance.Volume = event.target.value

        this.#UpdateIcon(event.target.value)
    }
    static OnSliderLooseFocus() {
        this.#sliderFocus = false
        this.Hide()
    }
    static Show() {
        VolumeButton.menuOpen = true
        VolumeButton.#volumeSlider.style.display = "flex"
        VolumeButton.#volumeButton.classList.add("active")
    }
    static Hide() {
        VolumeButton.menuOpen = false
        VolumeButton.#volumeSlider.style.display = "none"
        localStorage.setItem("volume", AudioPlayer.instance.Volume)
        VolumeButton.#volumeButton.classList.remove("active")
    }
}