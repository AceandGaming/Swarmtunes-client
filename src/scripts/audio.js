class Audio {
    static get audio() {
        return document.getElementById("audio-player")
    }

    static #audioLoaded = false

    static Pause() {
        this.audio.pause()
    }
    static Play(song) {
        if (this.#audioLoaded) {
            this.audio.play()
        }
        if (song !== undefined) {
            if (song.uuid === "swarmfm") {
                SwarmFM.Play()
                return
            }
            this.audio.addEventListener("canplay", () => {
                this.audio.play()
            })
            this.audio.src = Network.serverURL + "/files/" + song.uuid
            this.#audioLoaded = true
            DisplaySong(song)
        }
        SwarmFM.Stop()
    }
    static Seek(percent) {
        if (this.audio.readyState === 0) {
            return
        }
        const wasPaused = this.audio.paused
        this.audio.pause()
        this.audio.currentTime = this.audio.duration * percent
        if (!wasPaused) {
            this.audio.play()
        }
    }
    static SeekToTime(time) {
        if (this.audio.readyState === 0) {
            return
        }
        this.Seek(time / this.audio.duration)
    }
    static SeekOffset(offset) {
        this.SeekToTime((this.audio.currentTime || 0) + (offset || 10))
    }
}

class SwarmFM {
    static get song() {
        return new Song("swarmfm", "SwarmFM", "boop", "unknown", "swarmfm")
    }

    swarmfmPlaying = false
    paused = false
    currentSong
    nextSong
    audio

    static UpdateSongBar() {
        if (!SwarmFM.swarmfmPlaying) {
            return
        }
        function OnInfoLoaded(info) {
            SwarmFM.currentSong = info.currentSong
            SwarmFM.nextSong = info.nextSong
            DisplaySong(info.currentSong)
            setTimeout(SwarmFM.UpdateSongBar, (info.duration - info.position) * 1000)
        }
        Network.GetSwarmFMInfo().then(info => OnInfoLoaded(info))
    }
    static CheckInSync() {
        const audio = SwarmFM.audio
        if (audio.readyState === 0 || !SwarmFM.swarmfmPlaying) {
            return
        }
        const end = audio.seekable.end(audio.seekable.length - 1);
        const diff = end - audio.currentTime
        audio.playbackRate = Math.max(Math.floor(diff + 0.5) / 8 + 0.5, 1)
        if (diff > 6 && !audio.paused) {
            audio.pause()
            audio.currentTime = end - 4
            audio.playbackRate = 1
            audio.play()
        }
        if (diff < 1) {
            audio.playbackRate = 1
            audio.load()
        }
        if (audio.paused && !SwarmFM.paused) {
            audio.play()
        }
    }
    static Initalise() {
        const audio = new window.Audio()
        audio.id = "swarmfm-radio"
        Network.GetSwarmFMStream().then(swarmfm => audio.src = swarmfm)
        audio.preload = "auto"
        audio.load()
        audio.addEventListener("pause", () => {
            if (!SwarmFM.paused) {
                SwarmFM.audio.play()
            }
        })
        this.audio = audio
    }
    static Pause() {
        this.paused = true
        this.audio.pause()
    }
    static Play() {
        throw new Error("Sorry SwarmFM support is currently broken :(")
        this.paused = false
        Audio.Pause()
        this.audio.load()
        this.audio.play()
        this.swarmfmPlaying = true
        this.UpdateSongBar()
        setInterval(this.CheckInSync, 1000)
    }
    static Stop() {
        this.Pause()
        this.swarmfmPlaying = false
        clearInterval(this.CheckInSync)
    }
}

function ResumeAudio() {
    if (SwarmFM.swarmfmPlaying) {
        SwarmFM.Play()
    }
    else {
        Audio.Play()
    }
}
function PauseAudio() {
    SwarmFM.Pause()
    Audio.Pause()
}
function IsPaused() {
    return Audio.audio.paused && SwarmFM.audio.paused
}