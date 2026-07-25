import SwarmFMApi from '@aceandgaming/swarmfm-api'
import AudioPlayer from '@ts/audio/audio'
import { Song } from '@ts/types/song'

export default class SwarmFMRadio extends AudioPlayer {
    public get played(): number {
        return 0
    }
    public set played(value: number) { }
    public get duration(): number {
        return 0
    }
    public get isPlaying(): boolean {
        return this.api.Playing
    }

    iframe: HTMLIFrameElement
    api: SwarmFMApi

    constructor(onPlay: () => void, onPause: () => void, onUpdate: () => void, onEnded: () => void, onMetadata: (song: Song) => void) {
        super(onPlay, onPause, onUpdate, onEnded)

        this.api = new SwarmFMApi()

        this.iframe = this.api.CreateIFrame({
            silent: undefined,
            autoplay: false,
            controls: false
        })

        this.api.addEventListener("onplay", onPlay)
        this.api.addEventListener("onpause", onPause)
        this.api.addEventListener("onmetadatachange", (meta) => console.log(meta))
    }

    public async Load(song: Song): Promise<void> {
        await this.api.WaitForReady()
    }


    public Play(): void {
        this.api.Play()
    }
    public Pause(): void {
        this.api.Pause()
    }
    public Destroy(): Promise<void> | void {
        this.iframe.remove()
    }
}