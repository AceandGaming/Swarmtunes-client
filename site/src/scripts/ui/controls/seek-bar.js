// class SeekBar {
//     static get element() {
//         return this.#seekBar
//     }
//     static #seekBar
//     static #seekProgress
//     static #seekLoaded
//     static #startTime
//     static #endTime

//     static Attach(seek, seekBar) {
//         this.#seekBar = seekBar
//         this.#seekProgress = seekBar.querySelector(".progress")
//         this.#seekLoaded = seekBar.querySelector(".loaded")

//         const times = seek.querySelectorAll(".seek-time")
//         if (times.length === 2) {
//             this.#startTime = times[0]
//             this.#endTime = times[1]
//         }

//         this.#seekBar.addEventListener("mousedown", SeekBar.OnSeekBarMouseDown)
//         this.#seekBar.addEventListener("touchstart", SeekBar.OnSeekBarMouseDown)

//         AudioPlayer.instance.OnTimeUpdate(this.OnTimeUpdate.bind(this))
//         SwarmFM.instance.OnTimeUpdate(this.OnTimeUpdate.bind(this))
//     }
//     static Create(showTime = false) {
//         const seek = document.createElement("div")
//         seek.id = "seek-bar-container"
//         let html = `
//                 <div class="seek-bar">
//                     <div class="loaded"></div>
//                     <div class="progress"></div>
//                 </div>`

//         if (showTime) {
//             html = `
//                 <span class="seek-time">0:00</span>`
//                 + html +
//                 `<span class="seek-time">0:00</span>`
//         }

//         seek.innerHTML = html
//         this.Attach(seek, seek.querySelector("#seek-bar"))
//         return seek
//     }
//     static OnTimeUpdate(played, duration, loaded) {
//         this.#seekProgress.style.width = `${(played / duration) * 100}%`
//         this.#seekLoaded.style.width = `${(loaded / duration) * 100}%`

//         if (this.#startTime) {
//             this.#startTime.textContent = FormatTime(played)
//             this.#endTime.textContent = FormatTime(duration)
//         }

//         navigator.mediaSession.setPositionState({
//             duration: duration,
//             playbackRate: 1,
//             position: played,
//         });
//     }

//     static OnSeek(event) {
//         const rect = SeekBar.element.getBoundingClientRect();
//         let fraction = (event.clientX - rect.left) / rect.width;
//         fraction = Math.min(1, Math.max(0, fraction));
//         AudioPlayer.instance.Seek(fraction);
//     }
//     static OnSeekMobile(event) {
//         const rect = SeekBar.element.getBoundingClientRect();
//         let fraction = (event.touches[0].clientX - rect.left) / rect.width;
//         fraction = Math.min(1, Math.max(0, fraction));
//         AudioPlayer.instance.Seek(fraction);
//     }
//     static OnSeekBarMouseDown(event) {
//         document.addEventListener("mousemove", SeekBar.OnSeek);
//         document.addEventListener("touchmove", SeekBar.OnSeekMobile);
//         document.addEventListener("mouseup", SeekBar.OnSeekBarMouseUp);
//         document.addEventListener("touchend", SeekBar.OnSeekBarMouseUp);
//         SeekBar.OnSeek(event);
//     }
//     static OnSeekBarMouseUp(event) {
//         document.removeEventListener("mousemove", SeekBar.OnSeek);
//         document.removeEventListener("mouseup", SeekBar.OnSeekBarMouseUp);
//         document.removeEventListener("touchmove", SeekBar.OnSeekMobile);
//         document.removeEventListener("touchend", SeekBar.OnSeekBarMouseUp);
//     }
// }

class SeekBar {
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

    constructor(showTime = true) {
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

        seekBar.addEventListener("mousedown", Click.bind(this))
        seekBar.addEventListener("touchstart", Click.bind(this))
        document.addEventListener("mouseup", this.OnSeekBarMouseUp.bind(this));
        document.addEventListener("touchend", this.OnSeekBarMouseUp.bind(this));
        document.addEventListener("mousemove", this.OnSeek.bind(this));
        document.addEventListener("touchmove", this.OnSeekMobile.bind(this));

        AudioPlayer.instance.OnTimeUpdate(this.OnTimeUpdate.bind(this))
        SwarmFM.instance.OnTimeUpdate(this.OnTimeUpdate.bind(this))
        YoutubePlayer.instance.OnTimeUpdate(this.OnTimeUpdate.bind(this))
    }
    OnTimeUpdate(played, duration, loaded) {
        this.#seekProgress.style.width = `${(played / duration) * 100}%`
        this.#seekLoaded.style.width = `${(loaded / duration) * 100}%`

        if (this.#startTime) {
            this.#startTime.textContent = FormatTime(played)
            this.#endTime.textContent = FormatTime(duration)
        }
    }
    OnSeek(event) {
        if (!this.#dragging) {
            return;
        }
        const rect = this.#seekBar.getBoundingClientRect();
        let fraction = (event.clientX - rect.left) / rect.width;
        fraction = Math.min(1, Math.max(0, fraction));
        AudioPlayer.instance.Seek(fraction);
        YoutubePlayer.instance.Seek(fraction);
    }
    OnSeekMobile(event) {
        if (!this.#dragging) {
            return;
        }
        const rect = this.#seekBar.getBoundingClientRect();
        let fraction = (event.touches[0].clientX - rect.left) / rect.width;
        fraction = Math.min(1, Math.max(0, fraction));
        AudioPlayer.instance.Seek(fraction);
        YoutubePlayer.instance.Seek(fraction);
    }
    OnSeekBarMouseDown(event) {
        this.#dragging = true
        this.OnSeek(event);
    }
    OnSeekBarMouseUp(event) {
        this.#dragging = false
    }
}