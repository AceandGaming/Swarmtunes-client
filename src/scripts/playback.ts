import type AudioPlayer from "@ts/audio/audio"
import SongQueue from "@ts/song-queue"
import type { Song } from "@ts/types/song"
import OggPlayer from "@ts/audio/ogg"
import YoutubePlayer from "@ts/audio/youtube"

export class PlaybackController {
    private queue = new SongQueue()

    private player?: AudioPlayer
    private preload?: AudioPlayer

    private LoadPreloaded() {
        this.player = this.preload
        this.preload = undefined
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
            this.player = new type(
                () => { },
                () => { },
                () => { },
                () => this.Next(),
            ) as AudioPlayer
        }

        this.preload = undefined

        return this.player
    }

    public Play() {
        this.player?.Play()
    }
    public Pause() {
        this.player?.Pause()
    }

    public async Next() {
        const nextSong = this.queue.Next()
        if (!nextSong) {
            return
        }

        if (this.preload) {
            this.LoadPreloaded()
            return
        }

        const player = this.UpdatePlayer(nextSong)

        await player.Load(nextSong)
    }
    public async Previous() {
        const nextSong = this.queue.Previous()
        if (!nextSong) {
            return
        }

        const player = this.UpdatePlayer(nextSong)
        await player.Load(nextSong)
    }
}


const playbackController = new PlaybackController()
export default playbackController