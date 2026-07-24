import type AudioPlayer from "@ts/audio/audio"
import type { Song } from "@ts/types/song"
import SongRequester from "@ts/song-requester"

export default class OggPlayer implements AudioPlayer {
    public get played(): number {
        return this.audio.currentTime
    }
    public set played(value: number) {
        this.audio.currentTime = value
    }
    public get duration(): number {
        return this.audio.duration
    }

    private audio: HTMLAudioElement

    constructor(onPlay: () => void, onPause: () => void, onUpdate: () => void, onEnded: () => void) {
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
        this.audio.remove()
    }
}