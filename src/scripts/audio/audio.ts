import type { Song } from "@ts/types/song"

export default abstract class AudioPlayer {
    public abstract get played(): number
    public abstract set played(value: number)
    public abstract get duration(): number
    public abstract get isPlaying(): boolean

    constructor(
        onPlay: () => void,
        onPause: () => void,
        onUpdate: () => void,
        onEnded: () => void
    ) { }

    public abstract Load(song: Song): Promise<void> | void
    public abstract Play(): void
    public abstract Pause(): void
    public abstract Destroy(): Promise<void> | void
    public abstract SetVolume(volume: number): void

    public GetIframe(): HTMLIFrameElement | undefined {
        return undefined
    }
}