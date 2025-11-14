class Audio {
    static get audio() {
        return this.#currentAudio;
    }

    static #audioA = new window.Audio();
    static #audioB = new window.Audio();
    static #usingB = false;

    static #currentAudio = this.#audioA;

    static Pause() {
        this.#currentAudio.pause();
    }
    static Play(song) {
        if (song !== undefined) {
            //this.#usingB = false
            //this.#audioA.preload = "none"
            //this.#audioB.preload = "none"

            // this.#audioA.addEventListener("canplay", () => {
            //     this.#audioA.play()
            // })
            this.#audioA.src = Network.serverURL + "/files/" + song.uuid;
            //this.#audioB.src = ""
            //this.#currentAudio = this.#audioA
            CurrentSongBar.DisplaySong(song);
        }
        this.#currentAudio.play();
        SwarmFM.Stop();
    }
    static Preload(song) {
        throw new Error("idk");
        let audio = null;
        if (this.#usingB) {
            audio = this.#audioA;
        } else {
            audio = this.#audioB;
        }
        audio.preload = "auto";
        audio.src = Network.serverURL + "/files/" + song.uuid;

        function PlayPreloaded(event) {
            this.#usingB = !this.#usingB;
            audio.preload = "none";
            this.#currentAudio.removeEventListener("ended", PlayPreloaded);
            this.#currentAudio = audio;
            audio.play();
        }
        this.#currentAudio.addEventListener("ended", PlayPreloaded);
    }
    static Seek(percent) {
        if (!percent) {
            return;
        }
        if (this.#currentAudio.readyState === 0) {
            return;
        }
        const wasPaused = this.#currentAudio.paused;
        this.#currentAudio.pause();
        this.#currentAudio.currentTime = this.#currentAudio.duration * percent;
        if (!wasPaused) {
            this.audio.play();
        }
    }
    static SeekToTime(time) {
        if (this.#currentAudio.readyState === 0) {
            return;
        }
        this.Seek(time / this.#currentAudio.duration);
    }
    static SeekOffset(offset) {
        if (this.#currentAudio.readyState === 0) {
            return;
        }
        this.SeekToTime((this.#currentAudio.currentTime || 0) + (offset || 10));
    }
}

class SwarmFM {
    static get song() {
        return new Song("swarmfm", "SwarmFM", "boop", [], "unknown", "swarmfm");
    }
    static get currentTime() {
        return Math.max(0, SwarmFM.audio.currentTime - SwarmFM.startTime - SwarmFM.TARGET_LATENCY);
    }
    static get buffered() {
        const end = SwarmFM.audio.seekable.end(SwarmFM.audio.seekable.length - 1);
        return Math.max(0, end - SwarmFM.startTime);
    }

    static TARGET_LATENCY = 4;
    static swarmfmPlaying = false;
    static paused = false;
    static currentSong;
    static nextSong;
    static audio;
    static startTime;
    static duration;

    static UpdateSongBar() {
        if (!SwarmFM.swarmfmPlaying) {
            return;
        }
        function OnInfoLoaded(info) {
            SwarmFM.currentSong = info.currentSong;
            SwarmFM.nextSong = info.nextSong;
            CurrentSongBar.DisplaySong(info.currentSong);
            SwarmFM.startTime = SwarmFM.audio.currentTime - info.position;
            SwarmFM.duration = info.duration;
            setTimeout(
                SwarmFM.UpdateSongBar,
                (info.duration - info.position + SwarmFM.TARGET_LATENCY / 2) * 1000
            );
        }
        Network.GetSwarmFMInfo().then((info) => OnInfoLoaded(info));
    }
    static CheckInSync() {
        const audio = SwarmFM.audio;
        const TARGET_LATENCY = SwarmFM.TARGET_LATENCY;
        if (audio.readyState === 0 || !SwarmFM.swarmfmPlaying) {
            return;
        }
        const end = audio.seekable.end(audio.seekable.length - 1);
        const diff = end - audio.currentTime;
        audio.playbackRate = Math.max(Math.floor(diff + 0.5) / (TARGET_LATENCY * 2) + 0.5, 1);
        if (diff > TARGET_LATENCY + 2 && !audio.paused) {
            audio.pause();
            audio.currentTime = end - TARGET_LATENCY;
            audio.playbackRate = 1;
            audio.play();
        }
        if (diff < TARGET_LATENCY / 4) {
            audio.playbackRate = 1;
            audio.load();
        }
        if (audio.paused && !SwarmFM.paused) {
            audio.play();
        }
    }
    static Initalise() {
        const audio = new window.Audio();
        audio.id = "swarmfm-radio";
        Network.GetSwarmFMStream().then((swarmfm) => (audio.src = swarmfm));
        audio.preload = "auto";
        audio.load();
        audio.addEventListener("pause", () => {
            if (!SwarmFM.paused) {
                SwarmFM.audio.play();
            }
        });
        this.audio = audio;
    }
    static Pause() {
        this.paused = true;
        this.audio.pause();
    }
    static Play() {
        this.paused = false;
        Audio.Pause();
        this.audio.load();
        this.audio.play();
        this.swarmfmPlaying = true;
        this.UpdateSongBar();
        setInterval(this.CheckInSync, 1000);
    }
    static Stop() {
        this.Pause();
        this.swarmfmPlaying = false;
        clearInterval(this.CheckInSync);
    }
}

function ResumeAudio() {
    if (SwarmFM.swarmfmPlaying) {
        SwarmFM.Play();
    } else {
        Audio.Play();
    }
}
function PauseAudio() {
    SwarmFM.Pause();
    Audio.Pause();
}
function IsPaused() {
    return Audio.audio.paused && SwarmFM.audio.paused;
}
