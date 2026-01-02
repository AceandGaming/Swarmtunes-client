class SwarmFMInfo {
    constructor(
        public currentSong: Song,
        public nextSong: Song,
        public position: number,
        public duration: number
    ) { }
}
class SwarmFM extends AudioBase {
    static instance = new SwarmFM()
    static TARGET_LATENCY = 0.2

    get Audio(): HTMLAudioElement {
        return this.audio
    }
    get Played(): number {
        if (!this.startTime) {
            return 0
        }
        return Math.max(0, (performance.now() / 1000) - this.startTime - SwarmFM.TARGET_LATENCY)
    }
    get Loaded(): number {
        if (!this.startTime) {
            return 0
        }
        if (this.audio.buffered.length < 1) {
            return 0
        }
        return Math.max(0, this.audio.buffered.end(this.audio.buffered.length - 1) - this.startTime)
    }
    get Duration(): number {
        return this.duration || 0
    }
    get Paused(): boolean {
        return this.paused
    }
    set Paused(value: boolean) {
        if (value) {
            this.Pause()
        }
        else {
            this.Play()
        }
    }
    get Volume(): number {
        return this.volume
    }
    set Volume(value: number) {
        this.volume = value
        if (!this.Paused) {
            this.audio.volume = value
        }
    }
    get HasControl(): boolean {
        return this.hasControl
    }

    private audio: HTMLAudioElement
    private duration: number | null = null
    private startTime: number | null = null
    private currentSong: Song | null = null
    private hasControl: boolean = false
    private paused: boolean = true
    private volume: number = 0.5
    private syncId: number | null = null
    private toast: any | null = null

    constructor() {
        super()
        this.audio = new window.Audio()
        this.audio.preload = "none"
    }

    private async CheckSync() {
        if (!this.hasControl) {
            return
        }
        const url = Network.GetSwarmFMSongUrl(Number(this.currentSong!.Id))
        if (url !== this.audio.src) {
            this.audio.volume = 0
            this.audio.src = url
        }
        else {
            this.audio.volume = this.volume
        }

        if (!this.paused && this.audio.paused) {
            this.audio.play()
        }
        if (this.audio.buffered.length < 1) {
            return
        }
        const end = this.Played + SwarmFM.TARGET_LATENCY
        const latency = end - this.audio.currentTime
        console.log("SwarmFM latency:", latency)
        if (latency < SwarmFM.TARGET_LATENCY / 4 || latency > SwarmFM.TARGET_LATENCY + 1) {
            this.audio.currentTime = end - SwarmFM.TARGET_LATENCY
            this.audio.playbackRate = 1
        }
        else if (!isMobile) {
            const give = 20
            this.audio.playbackRate = Math.max(1, ((latency / SwarmFM.TARGET_LATENCY) + give) / (give + 1))
        }
    }
    private async UpdateInfo() {
        if (!this.hasControl) {
            return
        }
        const info = await Network.GetSwarmFMInfo()
        if (!info) {
            // this.toast.type = "error"
            // if (this.toast) this.toast.message = "Could not connect to SwarmFM servers"
            return
        }
        this.currentSong = info.currentSong
        this.duration = info.duration
        this.startTime = performance.now() / 1000 - info.position

        PlaybackController.DisplaySwarmFMInfo(info)

        setTimeout(
            this.UpdateInfo.bind(this),
            (info.duration - info.position + SwarmFM.TARGET_LATENCY) * 1000
        )
    }
    Load() {
        this.hasControl = true
        this.UpdateInfo()
    }
    Play(): void {
        if (!this.paused) {
            return
        }
        if (PlaybackController.HasControl != this && PlaybackController.HasControl) {
            PlaybackController.HasControl.Clear()
        }

        this.paused = false
        if (!this.hasControl) {
            this.toast = ToastManager.Toast("Connecting to SwarmFM...", "info", 0)
            this.audio.onloadeddata = () => {
                if (this.toast) {
                    this.toast.message = "Connected!"
                    setTimeout(() => this.toast?.Hide(), 2000)
                }
            }
            this.Load()
        }
        else {
            this.audio.play()
        }
        this.UpdateInfo().then(() => {
            if (this.toast) this.toast.message = "Loading Audio..."
        })
        NowPlaying.Clear()
        this.audio.volume = this.volume
        if (this.syncId) {
            clearInterval(this.syncId)
        }
        this.syncId = setInterval(this.CheckSync.bind(this), 1000)
        PlaybackController.UpdateMediaSession({ playPause: true })
        PlayState.Update({ currentSongId: "swarmfm", played: this.Played, songIds: [] })
    }
    Pause(): void {
        this.audio.pause()
        this.paused = true
        if (this.syncId) {
            clearInterval(this.syncId)
        }
    }
    Clear(): void {
        this.Pause()
        this.duration = null
        this.startTime = null
        this.hasControl = false
        this.audio.src = ""
    }

    public OnPlayPause(callback: (state: boolean) => void): void {
        this.audio.addEventListener("play", () => callback(true))
        this.audio.addEventListener("pause", () => callback(false))
    }
    public OnTimeUpdate(callback: (played: number, duration: number, loaded: number) => void): void {
        this.audio.addEventListener("timeupdate", () => callback(this.Played, this.Duration, this.Loaded))
    }
}