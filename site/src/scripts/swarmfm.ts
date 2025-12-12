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
    static TARGET_LATENCY = 4

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

    constructor() {
        super()
        this.audio = new window.Audio()
        this.audio.id = "swarmfm-radio"
        this.audio.preload = "none"
    }

    private async CheckSync() {
        if (!this.hasControl) {
            return
        }
        if (!this.paused && this.audio.paused) {
            this.Play()
        }
        if (this.audio.buffered.length < 1) {
            return
        }
        const end = this.audio.buffered.end(this.audio.buffered.length - 1)
        const latency = end - this.audio.currentTime
        console.log("SwarmFM latency:", latency)
        if (latency < 0.1 || latency > SwarmFM.TARGET_LATENCY + 1) {
            this.audio.currentTime = end - SwarmFM.TARGET_LATENCY
            this.audio.playbackRate = 1
        }
        else {
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
            return
        }
        this.currentSong = info.currentSong
        this.duration = info.duration
        this.startTime = performance.now() / 1000 - info.position

        const song = this.currentSong
        PlaybackController.DisplaySwarmFMInfo(info)

        setTimeout(
            this.UpdateInfo.bind(this),
            (info.duration - info.position + SwarmFM.TARGET_LATENCY) * 1000
        )
    }
    Load() {
        this.hasControl = true
        Network.GetSwarmFMStream().then((swarmfm) => { this.audio.src = swarmfm; this.audio.play() })
    }
    Play(): void {
        if (!this.paused) {
            return
        }
        AudioPlayer.instance.Clear()

        this.paused = false
        if (!this.hasControl) {
            this.Load()
        }
        else {
            this.audio.play()
        }
        this.UpdateInfo()
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