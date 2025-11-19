class SeekBar {
    static get element() {
        return this.#seekBar
    }
    static #seekBar
    static #seekProgress
    static #seekLoaded
    static #startTime
    static #endTime

    static Attach(seekBar) {
        this.#seekBar = seekBar
        this.#seekProgress = seekBar.querySelector("#seek-progress")
        this.#seekLoaded = seekBar.querySelector("#seek-loaded")

        const times = seekBar.querySelectorAll(".seek-time")
        if (times.length === 2) {
            this.#startTime = times[0]
            this.#endTime = times[1]
        }

        this.#seekBar.addEventListener("mousedown", SeekBar.OnSeekBarMouseDown)
        this.#seekBar.addEventListener("touchstart", SeekBar.OnSeekBarMouseDown)

        AudioPlayer.instance.OnTimeUpdate(this.OnTimeUpdate.bind(this))
        SwarmFM.instance.OnTimeUpdate(this.OnTimeUpdate.bind(this))
    }
    static OnTimeUpdate(played, duration, loaded) {
        this.#seekProgress.style.width = `${(played / duration) * 100}%`
        this.#seekLoaded.style.width = `${(loaded / duration) * 100}%`

        if (this.#startTime) {
            this.#startTime.textContent = FormatTime(played)
            this.#endTime.textContent = FormatTime(duration)
        }

        navigator.mediaSession.setPositionState({
            duration: duration,
            playbackRate: 1,
            position: played,
        });
    }

    static OnSeek(event) {
        const rect = SeekBar.element.getBoundingClientRect();
        let fraction = (event.clientX - rect.left) / rect.width;
        fraction = Math.min(1, Math.max(0, fraction));
        AudioPlayer.instance.Seek(fraction);
    }
    static OnSeekMobile(event) {
        const rect = SeekBar.element.getBoundingClientRect();
        let fraction = (event.touches[0].clientX - rect.left) / rect.width;
        fraction = Math.min(1, Math.max(0, fraction));
        AudioPlayer.instance.Seek(fraction);
    }
    static OnSeekBarMouseDown(event) {
        document.addEventListener("mousemove", SeekBar.OnSeek);
        document.addEventListener("touchmove", SeekBar.OnSeekMobile);
        document.addEventListener("mouseup", SeekBar.OnSeekBarMouseUp);
        document.addEventListener("touchend", SeekBar.OnSeekBarMouseUp);
        SeekBar.OnSeek(event);
    }
    static OnSeekBarMouseUp(event) {
        document.removeEventListener("mousemove", SeekBar.OnSeek);
        document.removeEventListener("mouseup", SeekBar.OnSeekBarMouseUp);
        document.removeEventListener("touchmove", SeekBar.OnSeekMobile);
        document.removeEventListener("touchend", SeekBar.OnSeekBarMouseUp);
    }
}