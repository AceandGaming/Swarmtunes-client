class VolumeButton {
    static #volumeButton;
    static #volumeSlider;

    static #sliderFocus = false;

    static Attach(volumeButton, volumeSlider) {
        this.#volumeButton = volumeButton
        this.#volumeSlider = volumeSlider

        this.#volumeButton.addEventListener("click", this.OnButtonClick.bind(this));
        this.#volumeButton.addEventListener("blur", this.OnButtonLooseFocus.bind(this));
        this.#volumeSlider.addEventListener("input", this.OnSliderChange.bind(this));
        this.#volumeSlider.addEventListener("blur", this.OnSliderLooseFocus.bind(this));

        const volume = localStorage.getItem("volume") || 0.75;
        this.#volumeSlider.value = volume;
        AudioPlayer.instance.Volume = volume;
        SwarmFM.instance.Volume = volume;
        this.#UpdateIcon(volume);
    }
    static OnButtonClick() {
        this.Show();
    }
    static OnButtonLooseFocus() {
        if (!this.#sliderFocus) {
            this.Hide();
        }
    }
    static #UpdateIcon(volume) {
        const icon = this.#volumeButton.querySelector("img");
        if (AudioPlayer.instance.Volume === 0) {
            icon.src = "src/assets/icons/volume-off.svg";
        } else if (AudioPlayer.instance.Volume < 0.5) {
            icon.src = "src/assets/icons/volume-2.svg";
        } else {
            icon.src = "src/assets/icons/volume.svg";
        }
    }
    static OnSliderChange(event) {
        this.#sliderFocus = true;
        AudioPlayer.instance.Volume = event.target.value;
        SwarmFM.instance.Volume = event.target.value;

        this.#UpdateIcon(event.target.value);
    }
    static OnSliderLooseFocus() {
        this.#sliderFocus = false;
        this.Hide();
    }
    static Show() {
        VolumeButton.#volumeSlider.style.display = "flex";
    }
    static Hide() {
        VolumeButton.#volumeSlider.style.display = "none";
        localStorage.setItem("volume", AudioPlayer.instance.Volume);
    }
}