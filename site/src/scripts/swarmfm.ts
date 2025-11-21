class SwarmFMInfo {
    constructor(
        public currentSong: Song,
        public nextSong: Song,
        public position: number,
        public duration: number
    ) {}
}
class SwarmFM extends AudioBase {
    static instance = new SwarmFM();
    static TARGET_LATENCY = 4;

    get Audio(): HTMLAudioElement {
        return this.audio;
    }
    get Played(): number {
        if (!this.startTime) {
            return 0;
        }
        return Math.max(0, this.audio.currentTime - this.startTime - SwarmFM.TARGET_LATENCY);
    }
    get Loaded(): number {
        if (!this.startTime) {
            return 0;
        }
        return Math.max(0, this.audio.seekable.end(this.audio.seekable.length - 1) - this.startTime);
    }
    get Duration(): number {
        return this.duration || 0;
    }
    get Paused(): boolean {
        return this.audio.paused;
    }
    set Paused(value: boolean) {
        if (value) {
            this.Pause();
        }
        else {
            this.Play();
        }
    }
    get Volume(): number {
        return this.volume;
    }
    set Volume(value: number) {
        this.volume = value;
        if (!this.Paused) {
            this.audio.volume = value;
        }
    }
    get HasControl(): boolean {
        return this.hasControl;
    }

    private audio: HTMLAudioElement
    private duration: number|null = null
    private startTime: number|null = null
    private currentSong: Song|null = null
    private hasControl: boolean = false
    private paused: boolean = true
    private volume: number = 0.5

    constructor() {
        super();
        this.audio = new window.Audio();
        this.audio.id = "swarmfm-radio";
        Network.GetSwarmFMStream().then((swarmfm) => (this.audio.src = swarmfm));
        this.audio.preload = "none";
        this.audio.volume = 0
    }

    private async CheckSync() {
        if (!this.paused && this.audio.paused) {
            this.Play();
        }
    }
    private async UpdateInfo() {
        if (!this.hasControl) {
            return;
        }
        const info = await Network.GetSwarmFMInfo(); 
        if (!info) {
            return;
        }
        this.currentSong = info.currentSong;
        this.duration = info.duration;
        this.startTime = this.audio.currentTime - info.position;

        const song = this.currentSong;
        let coverUrl = Network.GetCover(song.Cover, 256);
        if (song.HasCustomCover) {
            coverUrl = Network.swarmFMURL + song.Cover + ".png"
        }
        CurrentSongBar.Display(
            song.Title,
            song.Artist,
            song.Singers,
            coverUrl
        )

        setTimeout(
            this.UpdateInfo.bind(this),
            (info.duration - info.position + SwarmFM.TARGET_LATENCY / 2) * 1000
        );
    }
    Play(): void {
        if (!this.paused) {
            return;
        }
        AudioPlayer.instance.Clear();
        this.hasControl = true;
        this.paused = false;
        this.UpdateInfo();
        NowPlaying.Clear();
        this.audio.volume = this.volume;
        this.audio.play();
        setInterval(this.CheckSync.bind(this), 1000);
    }
    Pause(): void {
        this.audio.pause();
        this.paused = true;
    }
    Clear(): void {
        this.Pause()
        this.duration = null;
        this.startTime = null;
        this.hasControl = false;
    }

    public OnPlayPause(callback: (state: boolean) => void): void {
        this.audio.addEventListener("play", () => callback(true));
        this.audio.addEventListener("pause", () => callback(false));
    }
    public OnTimeUpdate(callback: (played: number, duration: number, loaded: number) => void): void {
        this.audio.addEventListener("timeupdate", () => callback(this.Played, this.Duration, this.Loaded));
    }
}