import AudioPlayer from "@ts/audio/audio"
import type { Song } from "@ts/types/song"
import PlaybackController from "@ts/playback"

export default class YoutubePlayer extends AudioPlayer {
    public get played(): number {
        return this.player?.getCurrentTime() ?? 0
    }
    public set played(value: number) {
        this.player.seekTo(value)
    }
    public get duration(): number {
        return this.player?.getDuration() ?? 0
    }
    public get isPlaying(): boolean {
        return !this.paused
    }

    private iframe: HTMLIFrameElement
    private player: any
    private volume: number = 0.5
    private paused = true
    private updateId: number
    private ready = false

    public GetIframe() {
        return this.iframe
    }

    public CreatePlayer() {
        this.iframe.src = "https://www.youtube-nocookie.com/embed/?enablejsapi=1&playsinline=1"
        const api = window.YT
        if (!api) {
            throw new Error("Youtube API not found")
        }

        const player = new api.Player("youtube-player", {})

        player.addEventListener("onReady", () => {
            console.log("Youtube Player Ready!")
            player.setVolume(this.volume * 100)
            this.ready = true
        })

        this.player = player

        return player
    }

    private WaitForReady(): Promise<void> {
        return new Promise(async (resolve) => {
            if (this.ready) {
                resolve()
            }
            this.player.addEventListener("onReady", () => {
                setTimeout(resolve, 1000)
            })
        })
    }

    constructor(onPlay: () => void, onPause: () => void, onUpdate: () => void, onEnded: () => void) {
        super(onPlay, onPause, onUpdate, onEnded)

        console.log("Creating Youtube Player...")
        const iframe = document.createElement("iframe")
        iframe.id = "youtube-player"
        iframe.allow = "autoplay; encrypted-media"
        iframe.width = "1"
        iframe.height = "1"
        iframe.setAttribute("playsinline", "1")
        iframe.sandbox = "allow-scripts allow-same-origin"
        iframe.style = `
            position: absolute;
            left: 1000px;
            top: 1000px;
        `

        document.body.append(iframe)
        this.iframe = iframe

        const player = this.CreatePlayer()

        player.addEventListener("onError", (event: any) => {
            console.error("YT error code:", event.data)
        })

        player.addEventListener("onStateChange", (event: any) => {
            if (this.player.getPlaylistIndex() !== 1) {
                return
            }

            switch (event.data) {
                case 0:
                    onEnded()
                    break
                case 1:
                    this.paused = false
                    onPlay()
                    break
                case 2:
                    this.paused = true
                    onPause()
                    break
                case 5:
                    break
            }
        })

        this.updateId = setInterval(() => {
            if (!this.ready) {
                return
            }

            const index = this.player.getPlaylistIndex()
            if (index === 2) {
                PlaybackController.Next()
            }
            if (index === 0) {
                PlaybackController.Previous()
            }

            onUpdate()
        }, 500)
    }



    public async Load(song: Song) {
        await this.WaitForReady()

        if (!song.YoutubeId) {
            throw new Error("Song has no youtube id")
        }

        this.player.loadPlaylist({
            // Youtube likes to steal the MediaSession api so we make a fake playlist and read when songs are skipped
            playlist: ["dkcz8QCcbq4", song.YoutubeId, "IUfVQ6zEAIQ"],
            index: 1,
            startSeconds: 0
        })
        this.player.setPlaybackQuality('small')
    }
    public Play(): void {
        this.player.playVideo()
    }
    public Pause(): void {
        this.player.pauseVideo()
    }
    public Destroy(): Promise<void> | void {
        clearInterval(this.updateId)

        this.player.destroy()
        this.iframe.remove()
    }

}