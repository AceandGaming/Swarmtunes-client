declare var YT: any;
declare var onYouTubeIframeAPIReady: () => void;

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
        this.player?.setVolume(value * 100);
    }
    public get HasControl(): boolean {
        return this.hasControl
    }
    public get CurrentSong(): Song | undefined {
        return this.currentSong
    }

    private iframe: HTMLIFrameElement
    private player: any | undefined
    private paused = true
    private hasControl = false
    private callbacks = new Map()
    private updateId: any = null
    private volume: number = 0.5
    private currentSong: Song | undefined
    private ready = false
    private loading = false

    constructor() {
        super();
        const iframe = document.createElement("iframe")
        iframe.id = "youtube-player"
        iframe.src = "about:blank"
        iframe.allow = "autoplay; encrypted-media"
        iframe.style.display = "none"
        iframe.sandbox = "allow-scripts allow-same-origin"

        document.body.append(iframe)

        this.iframe = iframe
    }

    private WaitForReady(): Promise<void> {
        return new Promise(async (resolve) => {
            if (this.ready) {
                return resolve()
            }
            if (!this.player) {
                await this.CreatePlayer()
            }
            this.player.addEventListener("onReady", () => {
                resolve()
            })
        })
    }
    private LoadYTAPI() {
        return new Promise((resolve) => {
            if (window.YT && window.YT.Player) {
                return resolve(window.YT);
            }

            const api = document.createElement("script");
            api.src = "https://www.youtube.com/iframe_api";
            document.body.appendChild(api);

            const previous = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = () => {
                if (previous) previous();
                resolve(window.YT);
            };
        });
    }
    public async CreatePlayer() {
        if (this.player || this.loading) {
            return
        }
        this.loading = true
        this.iframe.src = "https://www.youtube-nocookie.com/embed/?enablejsapi=1"
        const api = await this.LoadYTAPI() as any

        const player = new api.Player("youtube-player", {})

        player.addEventListener("onReady", () => {
            player.setVolume(this.volume * 100)
            this.ready = true
        })
        player.addEventListener("onStateChange", (event: any) => {
            if (!this.HasControl) {
                return
            }
            switch (event.data) {
                case 0:
                    this.CallCallbacks("ended")
                    break
                case 1:
                    this.paused = false
                    this.CallCallbacks("play")
                    break
                case 2:
                    this.paused = true
                    this.CallCallbacks("play")
                    break
                case 5:
                    this.player.playVideo()
                    break
            }
        })

        this.player = player
        this.loading = false
    }

    public async Play(song?: Song) {
        if (PlaybackController.HasControl != this && PlaybackController.HasControl) {
            PlaybackController.HasControl.Clear()
        }
        if (!this.ready) {
            await this.WaitForReady()
        }
        if (song) {
            if (!song.YoutubeId) {
                throw new Error("Song has no youtube id")
            }
            this.currentSong = song
            //this.iframe.src = `https://www.youtube-nocookie.com/embed/${song.YoutubeId}?enablejsapi=1`
            this.player.loadPlaylist({
                playlist: ["dkcz8QCcbq4", song.YoutubeId, "IUfVQ6zEAIQ"], //hack. Lets me detect when songs are skipped
                index: 1,
                startSeconds: 0
            });
            this.player.setPlaybackQuality('small');


            PlaybackController.DisplaySong(song)
            PlayState.Update({ currentSongId: song.Id })
        }
        this.paused = false
        this.hasControl = true
        this.player.pauseVideo()

        this.updateId = setInterval(() => {
            if (!this.hasControl) {
                return
            }
            const index = this.player.getPlaylistIndex()
            if (index > 1) {
                PlaybackController.NextTrack()
            }
            if (index < 1) {
                PlaybackController.PreviousTrack()
            }
            this.CallCallbacks("timeupdate")
        }, 500)

        PlaybackController.UpdateMediaSession({ playPause: true, skipping: SongQueue.songCount > 1, seeking: true })
    }
    public Pause(): void {
        this.player?.pauseVideo()
        this.paused = true
    }
    public Clear(): void {
        this.Pause()
        this.hasControl = false
        if (this.updateId) {
            clearInterval(this.updateId)
        }
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