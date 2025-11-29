class AudioPlayer extends AudioBase {
    static instance = new AudioPlayer();

    get Audio(): HTMLAudioElement {
        return this.audio;
    }
    get Played(): number {
        return this.audio.currentTime;
    }
    set Played(value: number) {
        if (!this.HasControl || !isFinite(value)) {
            return
        }
        try {
            this.audio.fastSeek(value);
        }
        catch {
            this.audio.currentTime = value
        }
    }
    get Loaded(): number {
        if (!this.audio.buffered.length) {
            return 0;
        }
        return this.audio.buffered.end(this.audio.buffered.length - 1);
    }
    get Duration(): number {
        return this.audio.duration || 0;
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
        this.audio.volume = value;
    }
    get HasControl(): boolean {
        return this.hasControl;
    }
    get CurrentSong(): Song|undefined {
        return this.currentSong
    }

    private audio: HTMLAudioElement
    private hasControl: boolean = false
    private paused: boolean = true
    private volume: number = 0.5
    private currentSong?: Song

    constructor() {
        super();
        this.audio = new window.Audio
    }

    
    public Play(song?: Song): void {
        SwarmFM.instance.Clear()
        this.hasControl = true
        this.paused = false
        this.audio.volume = this.volume
        if (song) {
            this.currentSong = song
            this.audio.src = Network.GetAudio(song)
            CurrentSongBar.DisplaySong(song)
            this.audio.oncanplay = () => {
                this.audio.play()
            }
        }
        else {
            this.audio.play()
        }
        

    }
    public Pause(): void {
        this.audio.pause()
        this.paused = true
    }
    public Clear(): void {
        this.Pause()
        this.hasControl = false
    }

    public OnPlayPause(callback: (state: boolean) => void): void {
        this.audio.addEventListener("play", () => callback(true));
        this.audio.addEventListener("pause", () => callback(false));
    }
    public OnTimeUpdate(callback: (played: number, duration: number, loaded: number) => void): void {
        this.audio.addEventListener("timeupdate", () => callback(this.Played, this.Duration, this.Loaded));
    }
    public OnVolumeUpdate(callback: (volume: number) => void): void {
        this.audio.addEventListener("volumechange", () => callback(this.Volume));
    }

    public Seek(fraction: number): void {
        if (!this.HasControl) {
            return
        }
        this.Played = fraction * this.audio.duration
        this.Play()
    }
    public Skip(seconds: number): void {
        if (!this.HasControl) {
            return
        }
        this.Played += seconds
        this.Play()
    }
}