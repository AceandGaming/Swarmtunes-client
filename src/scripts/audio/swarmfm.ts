import SwarmFMApi from '@aceandgaming/swarmfm-api'
import type { SwarmFMMetadata } from '@aceandgaming/swarmfm-api'
import AudioPlayer from '@ts/audio/audio'
import { Song } from '@ts/models/song'
import { GetCoverUrl } from '@ts/api/song'

export default class SwarmFMRadio extends AudioPlayer {
    public get played(): number {
        return this.api.currentTime
    }
    public set played(value: number) { }
    public get duration(): number {
        return this.api.current?.duration || 0
    }
    public get isPlaying(): boolean {
        return this.api.playing
    }

    private iframe: HTMLIFrameElement
    private api: SwarmFMApi

    constructor(onPlay: () => void, onPause: () => void, onUpdate: () => void, onEnded: () => void, onMetadata: (song: Song) => void) {
        super(onPlay, onPause, onUpdate, onEnded)

        this.api = new SwarmFMApi()

        this.iframe = this.api.CreateIFrame({
            silent: "all",
            autoplay: false,
            controls: false
        })

        this.api.addEventListener("onplay", onPlay)
        this.api.addEventListener("onpause", onPause)
        this.api.addEventListener("ontimeupdate", onUpdate)
        this.api.addEventListener("onmetadatachange", (meta: SwarmFMMetadata) => {
            const c = meta.current

            const singers = []
            for (let name of c.singer) {
                singers.push({ "neuro": "Neuro-sama", "evil": "Evil Neuro" }[name.toLowerCase()] || name)
            }
            const hasNeuro = c.singer.includes("neuro")
            const hasEvil = c.singer.includes("evil")

            let CoverUrl

            if (!c.album_cover_id) {
                let name
                if (hasNeuro && hasEvil) {
                    name = "duet"
                }
                else if (hasNeuro) {
                    name = "neuro"
                }
                else if (hasEvil) {
                    name = "evil"
                }

                CoverUrl = GetCoverUrl(`default/${name}`)
            }
            else {
                CoverUrl = `https://swarmfm-assets.boopdev.com/album_covers/${c.album_cover_id}.png`
            }

            const song = new Song(
                "swarmfm",
                c.name,
                undefined,
                [{ name: c.artist }],
                singers.map(a => ({ name: a })),
                {},
                new Date(Date.now())
            )

            onMetadata(song)
        })

        document.body.append(this.iframe)
        this.iframe.style = `
            position: absolute;
            left: 1000px;
            top: 1000px;
        `
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
    public SetVolume(volume: number): void {
        this.api.volume = volume
    }
}