class YoutubePlayer extends AudioBase {
    static instance = new YoutubePlayer()

    public get Audio(): HTMLAudioElement {
        throw new Error("Method not implemented.");
    }
    public get Played(): number {
        return this.player.getCurrentTime()
    }
    public set Played(value: number) {
        this.player.seekTo(value)
    }
    public get Loaded(): number {
        return this.player.getCurrentTime()
    }
    public get Duration(): number {
        return this.player.getDuration()
    }
    public get Paused(): boolean {
        return this.paused
    }
    public set Paused(value: boolean) {
        if (value) {
            this.Pause()
        }
        else {
            this.Play()
        }
    }
    get Volume(): number {
        return this.volume;
    }
    set Volume(value: number) {
        this.volume = value;
        this.player.setVolume(value * 100);
    }
    public get HasControl(): boolean {
        return this.hasControl
    }

    private player: any
    private paused = true
    private hasControl = false
    private callbacks = new Map()
    private updateId: any = null
    private volume: number = 0.5

    constructor() {
        super();

    }

    public AttachPlayer(player: any) {
        this.player = player
        player.addEventListener("onReady", () => {
            player.setVolume(this.volume * 100)
        })
        player.addEventListener("onStateChange", (event: any) => {
            if (event.data === 0) {
                this.CallCallbacks("ended")
            }
        })
    }

    public Play(song?: Song): void {
        if (PlaybackController.HasControl != this && PlaybackController.HasControl) {
            PlaybackController.HasControl.Clear()
        }
        if (song) {
            if (!song.YoutubeId) {
                throw new Error("Song has no youtube id")
            }
            this.player.loadVideoById(song.YoutubeId)

            PlaybackController.DisplaySong(song)
            PlayState.Update({ currentSongId: song.Id })
        }
        this.player.playVideo()
        this.paused = false
        this.hasControl = true

        this.CallCallbacks("play")
        this.updateId = setInterval(() => {
            if (!this.hasControl) {
                return
            }
            this.CallCallbacks("timeupdate")
        }, 500)

        PlaybackController.UpdateMediaSession({ playPause: true, skipping: SongQueue.songCount > 1, seeking: true })
    }
    public Pause(): void {
        this.player.pauseVideo()
        this.paused = true

        this.CallCallbacks("play")
        if (this.updateId) {
            clearInterval(this.updateId)
        }
    }
    public Clear(): void {
        this.Pause()
        this.hasControl = false
    }
    public OnPlayPause(callback: (state: boolean) => void): void {
        if (!this.callbacks.has("play")) {
            this.callbacks.set("play", [])
        }
        this.callbacks.get("play").push(() => callback(!this.Paused))
    }
    public OnTimeUpdate(callback: (played: number, duration: number, loaded: number) => void): void {
        if (!this.callbacks.has("timeupdate")) {
            this.callbacks.set("timeupdate", [])
        }
        this.callbacks.get("timeupdate").push(() => callback(this.Played, this.Duration, this.Loaded))
    }
    public OnEnd(callback: () => void): void {
        if (!this.callbacks.has("ended")) {
            this.callbacks.set("ended", [])
        }
        this.callbacks.get("ended").push(callback)
    }
    public Seek(fraction: number): void {
        this.player.seekTo(fraction * this.Duration)
    }
    public Skip(seconds: number): void {
        if (!this.HasControl) {
            return
        }
        this.Played += seconds
        this.Play()
    }

    private CallCallbacks(name: string) {
        if (this.callbacks.has(name)) {
            this.callbacks.get(name).forEach((callback: any) => callback())
        }
    }

}

function onYouTubeIframeAPIReady() {
    // @ts-ignore
    let player = new YT.Player('player', {
        height: '0',
        width: '0',
        playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1
        },
    });
    YoutubePlayer.instance.AttachPlayer(player)
}