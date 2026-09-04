import AudioPlayer from "@ts/audio/audio"
import type { Song } from "@ts/models/song"
import SongProvider from "@ts/song-provider"

export default class OggPlayer extends AudioPlayer {
    public get played(): number {
        return this.audio.currentTime
    }
    public set played(value: number) {
        this.audio.currentTime = value
    }
    public get duration(): number {
        const duration = this.audio.duration
        return (duration > 0) ? duration : 0
    }
    public get isPlaying(): boolean {
        return !this.audio.paused
    }
    public get volume(): number {
        return this.audio.volume
    }
    public set volume(value: number) {
        this.audio.volume = value
    }


    private audio: HTMLAudioElement
    private DisposeAudio?: () => void

    constructor(onPlay: () => void, onPause: () => void, onUpdate: () => void, onEnded: () => void) {
        super(onPlay, onPause, onUpdate, onEnded)

        this.audio = new Audio()

        this.audio.onplay = onPlay
        this.audio.onpause = onPause
        this.audio.ontimeupdate = onUpdate
        this.audio.onended = onEnded
    }


    public async Load(song: Song) {
        this.DisposeAudio?.()

        const audio = await SongProvider.GetAudio(song.id)

        this.audio.src = audio.url
        this.DisposeAudio = audio.Dispose
    }

    public Play(): void {
        if (this.audio.readyState === 4 || window.isMobile) {
            this.audio.play()
        }
        else {
            this.audio.oncanplay = () => {
                this.audio.play()
            }
        }
    }
    public Pause(): void {
        this.audio.pause()
    }
    public SetVolume(volume: number): void {
        this.audio.volume = volume
    }

    public Destroy(): void {
        this.audio.src = ""

        this.audio.remove()
        // @ts-ignore
        this.audio = null
    }
}