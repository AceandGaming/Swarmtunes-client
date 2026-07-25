import AudioPlayer from "@ts/audio/audio"
import type { Song } from "@ts/types/song"
import SongRequester from "@ts/song-requester"

export default class OggPlayer extends AudioPlayer {
    public get played(): number {
        return this.audio.currentTime
    }
    public set played(value: number) {
        this.audio.currentTime = value
    }
    public get duration(): number {
        return this.audio.duration
    }
    public get isPlaying(): boolean {
        return !this.audio.paused
    }
    private audio: HTMLAudioElement

    constructor(onPlay: () => void, onPause: () => void, onUpdate: () => void, onEnded: () => void) {
        super(onPlay, onPause, onUpdate, onEnded)

        this.audio = new Audio()

        this.audio.onplay = onPlay
        this.audio.onpause = onPause
        this.audio.ontimeupdate = onUpdate
        this.audio.onended = onEnded
    }


    public async Load(song: Song) {
        const url = await SongRequester.GetAudioUrl(song.Id)

        this.audio.src = url
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

    public Destroy(): void {
        this.audio.src = ""

        this.audio.remove()
        // @ts-ignore
        this.audio = null
    }
}