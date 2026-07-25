import type AudioPlayer from "@ts/audio/audio"
import SongQueue from "@ts/song-queue"
import type { Song } from "@ts/types/song"
import OggPlayer from "@ts/audio/ogg"
import YoutubePlayer from "@ts/audio/youtube"

type Callbacks = {
    loadedSong: (song: Song, iframe?: HTMLIFrameElement) => void
    playPause: (playing: boolean) => void
    shuffle: (shuffle: boolean) => void
    timeUpdate: (current: number, duration: number) => void
    queueChange: (queue: Song[]) => void
}

class PlaybackController {
    public get currentSong() {
        return this.queue.currentSong
    }


    private shuffle: boolean = false

    private queue = new SongQueue()

    private player?: AudioPlayer
    private preload?: AudioPlayer

    private callbacks: { [K in keyof Callbacks]?: Function[] } = {}



    private LoadPreloaded() {
        this.player = this.preload
        this.preload = undefined
    }

    private OnTimeUpdate() {
        if (!this.player) {
            return
        }

        this.Trigger("timeUpdate",
            this.player.played,
            this.player.duration,
        )
    }

    private UpdatePlayer(song: Song): AudioPlayer {
        let PlayerClass: typeof AudioPlayer
        if (song.YoutubeId) {
            PlayerClass = YoutubePlayer
        }
        else {
            PlayerClass = OggPlayer
        }

        if (!this.player || this.player.constructor !== PlayerClass) {
            this.player?.Destroy()
            // @ts-ignore
            this.player = new PlayerClass(
                () => this.Trigger("playPause", true),
                () => this.Trigger("playPause", false),
                () => this.OnTimeUpdate(),
                () => this.Next(),
            ) as AudioPlayer
        }

        this.preload?.Destroy()
        this.preload = undefined

        return this.player
    }
    public async PlaySong(song: Song) {
        const player = this.UpdatePlayer(song)
        await player.Load(song)
        this.Trigger("loadedSong", song, player.GetIframe())
        player.Play()
    }

    public Play({ song, songs }: { song?: Song, songs?: Song[] } = {}) {
        if (songs) {
            this.queue.PopulateQueue(songs, this.shuffle)
        }
        if (song) {
            this.queue.SkipTo(song)
        }
        if (song || songs) {
            this.Trigger("queueChange", this.queue.queue)
        }

        this.PlaySong(this.currentSong!)
    }
    public Pause() {
        this.player?.Pause()
    }
    public PlayPause() {
        if (this.player?.isPlaying) {
            this.Pause()
        } else {
            this.Play()
        }
    }

    public Seek(time: number) {
        if (!this.player) {
            return
        }

        this.player.played = time
    }
    public SeekPercent(percent: number) {
        if (!this.player) {
            return
        }

        this.player.played = this.player.duration * percent
    }
    public SeekSkip(relitive: number) {
        if (!this.player) {
            return
        }

        this.player.played += relitive
    }

    public SetShuffle(shuffle: boolean) {
        this.queue.ReShuffle(shuffle)
        this.Trigger("queueChange", this.queue.queue)

        this.shuffle = shuffle
        this.Trigger("shuffle", shuffle)
    }
    public ToggleShuffle() {
        this.SetShuffle(!this.shuffle)
    }

    public async Next() {
        const nextSong = this.queue.Next()
        if (!nextSong) {
            return
        }
        this.Trigger("queueChange", this.queue.queue)

        if (this.preload) {
            this.LoadPreloaded()
            return
        }

        this.PlaySong(nextSong)
    }
    public async Previous() {
        const nextSong = this.queue.Previous()
        if (!nextSong) {
            return
        }
        this.Trigger("queueChange", this.queue.queue)

        this.PlaySong(nextSong)
    }
    public SkipTo(song: Song) {
        this.queue.SkipTo(song)
        this.Trigger("queueChange", this.queue.queue)

        this.UpdatePlayer(song)
        this.PlaySong(this.currentSong!)
    }
    public AddToQueue(song: Song) {
        this.queue.Add(song)
        this.Trigger("queueChange", this.queue.queue)
    }

    public AddCallback<K extends keyof Callbacks>(event: K, callback: Callbacks[K]) {
        if (!this.callbacks[event]) {
            this.callbacks[event] = []
        }
        this.callbacks[event].push(callback)
    }
    private Trigger(event: keyof Callbacks, ...data: any) {
        if (!this.callbacks[event]) {
            return
        }
        //console.log("Trigged", event, data)
        this.callbacks[event].forEach(callback => callback(...data))
    }
}


const playbackController = new PlaybackController()
export default playbackController