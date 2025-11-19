class VolumeButton {
    static #volumeButton;
    static #volumeSlider;

    static #sliderFocus = false;

    static AttachInputs() {
        this.#volumeButton = document.getElementById("volume-controls");
        if (!this.#volumeButton) {
            return;
        }
        this.#volumeButton.addEventListener(
            "click",
            this.OnButtonClick.bind(this)
        );
        this.#volumeButton.addEventListener(
            "blur",
            this.OnButtonLooseFocus.bind(this)
        );
        this.#volumeSlider = document.querySelector("#volume-controls input");
        this.#volumeSlider.addEventListener(
            "input",
            this.OnSliderChange.bind(this)
        );
        this.#volumeSlider.addEventListener(
            "blur",
            this.OnSliderLooseFocus.bind(this)
        );
        const volume = localStorage.getItem("volume") || 0.75;
        this.#volumeSlider.value = volume;
        Audio.audio.volume = volume;
        //SwarmFM.audio.volume = volume;
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
        const icon = document.querySelector("#volume-controls img");
        if (Audio.audio.volume === 0) {
            icon.src = "src/assets/icons/volume-off.svg";
        } else if (Audio.audio.volume < 0.5) {
            icon.src = "src/assets/icons/volume-2.svg";
        } else {
            icon.src = "src/assets/icons/volume.svg";
        }
    }
    static OnSliderChange(event) {
        this.#sliderFocus = true;
        Audio.audio.volume = event.target.value;
        //SwarmFM.audio.volume = event.target.value;

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
        localStorage.setItem("volume", Audio.audio.volume);
    }
}

function AttachAudioControls() {
    const SeekBar = document.getElementById("seek-bar");
    Audio.audio.addEventListener("timeupdate", () =>
        UpdateSeekBar(Audio.audio)
    );
    // SwarmFM.audio.addEventListener("timeupdate", () =>
    //     UpdateSeekBar(SwarmFM.audio)
    // );
    Audio.audio.addEventListener("ended", () => OnAudioFinish());
    if ("mediaSession" in navigator) {
        navigator.mediaSessionSupported = true;
        navigator.mediaSession.setActionHandler("play", OnPauseButtonClick);
        navigator.mediaSession.setActionHandler("pause", OnPauseButtonClick);
        navigator.mediaSession.setActionHandler("nexttrack", OnNextButtonClick);
        navigator.mediaSession.setActionHandler("previoustrack", OnPreviousButtonClick);
        navigator.mediaSession.setActionHandler("seekto", (details) => {
            Audio.SeekToTime(details.seekTime);
        });
        navigator.mediaSession.setActionHandler("seekforward", (details) => {
            Audio.SeekOffset(details.seekOffset);
        });
        navigator.mediaSession.setActionHandler("seekbackward", (details) => {
            Audio.SeekOffset(-details.seekOffset);
        });
    }
    VolumeButton.AttachInputs();
    Audio.audio.addEventListener("play", () => UpdatePlayPauseIcon());
    Audio.audio.addEventListener("pause", () => UpdatePlayPauseIcon());
    // SwarmFM.audio.addEventListener("play", () => UpdatePlayPauseIcon());
    // SwarmFM.audio.addEventListener("pause", () => UpdatePlayPauseIcon());

    SeekBar.addEventListener("mousedown", OnSeekBarMouseDown);
    SeekBar.addEventListener("touchstart", OnSeekBarMouseDown);
}
function OnNextButtonClick() {
    const song = SongQueue.GetNextSong();
    if (song === null) {
        Audio.Pause();
        return;
    }
    Audio.Play(song);
    UpdateNowPlaying();
}
function OnPreviousButtonClick() {
    if (Audio.audio.currentTime > 5) {
        Audio.audio.currentTime = 0;
    } else {
        const song = SongQueue.GetPreviousSong();
        if (song === null) {
            return;
        }
        Audio.Play(song);
    }
    UpdateNowPlaying();
}
function OnPauseButtonClick() {
    if (IsPaused()) {
        ResumeAudio();
    } else {
        PauseAudio();
    }
}
function OnShuffleButtonClick() {
    SongQueue.suffleSongs = !SongQueue.suffleSongs;
    UpdateShuffleButton();
    UpdateNowPlaying();
}

function UpdatePlayPauseIcon() {
    const playPause = document.getElementById("play-pause");
    if (IsPaused()) {
        playPause.src = "src/assets/icons/play.svg";
    } else {
        playPause.src = "src/assets/icons/pause.svg";
    }
}
function UpdateShuffleButton() {
    const image = document.getElementById("shuffle-button");
    if (SongQueue.suffleSongs) {
        image.src = "src/assets/icons/active/shuffle.svg";
    } else {
        image.src = "src/assets/icons/shuffle.svg";
    }
}
function UpdateSeekBar(audio) {
    if (audio.readyState < 3) {
        return;
    }
    const seekBar = document.getElementById("seek-progress");
    const seekBarLoaded = document.getElementById("seek-loaded");
    const seekTimeStart = document.getElementById("song-time-start");
    const seekTimeEnd = document.getElementById("song-time-end");
    let currentTime, duration
    // if (SwarmFM.swarmfmPlaying) {
    //     currentTime = SwarmFM.currentTime;
    //     duration = SwarmFM.duration;
    // }
    //else {
    currentTime = audio.currentTime;
    duration = audio.duration
    //}
    if (audio.readyState < 3 || !isFinite(currentTime) || !isFinite(duration)) {
        //still loading
        seekBar.style.width = "0%";
        seekBarLoaded.style.width = "0%";
        if (seekTimeStart) {
            seekTimeStart.textContent = "0:00";
            seekTimeEnd.textContent = "0:00";
        }
        return;
    }
    let end = 0;
    // if (SwarmFM.swarmfmPlaying) {
    //     end = SwarmFM.buffered;
    // }
    //else {
    for (let i = 0; i < audio.buffered.length; i++) {
        if (audio.buffered.end(i) > end) {
            end = audio.buffered.end(i);
        }
    }
    //}

    seekBar.style.width = `${(currentTime / duration) * 100}%`;
    seekBarLoaded.style.width = `${(end / duration) * 100}%`;
    if (seekTimeStart) {
        seekTimeStart.textContent = FormatTime(currentTime);
        seekTimeEnd.textContent = FormatTime(duration);
    }

    if (!navigator.mediaSessionSupported) {
        return;
    }
    navigator.mediaSession.playbackState = audio.paused ? "paused" : "playing";
    navigator.mediaSession.setPositionState({
        duration: duration,
        playbackRate: audio.playbackRate,
        position: currentTime,
    });
}

function OnSeek(event) {
    const rect = CurrentSongBar.SeekBar.getBoundingClientRect();
    let fraction = (event.clientX - rect.left) / rect.width;
    fraction = Math.min(1, Math.max(0, fraction));
    Audio.Seek(fraction);
}
function OnSeekMobile(event) {
    const rect = CurrentSongBar.SeekBar.getBoundingClientRect();
    let fraction = (event.touches[0].clientX - rect.left) / rect.width;
    fraction = Math.min(1, Math.max(0, fraction));
    Audio.Seek(fraction);
}
function OnSeekBarMouseDown(event) {
    document.addEventListener("mousemove", OnSeek);
    document.addEventListener("touchmove", OnSeekMobile);
    document.addEventListener("mouseup", OnSeekBarMouseUp);
    document.addEventListener("touchend", OnSeekBarMouseUp);
    OnSeek(event);
}
function OnSeekBarMouseUp(event) {
    document.removeEventListener("mousemove", OnSeek);
    document.removeEventListener("mouseup", OnSeekBarMouseUp);
    document.removeEventListener("touchmove", OnSeekMobile);
    document.removeEventListener("touchend", OnSeekBarMouseUp);
}
function OnAudioFinish() {
    OnNextButtonClick();
}
