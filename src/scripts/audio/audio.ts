import type { Song } from "@ts/types/song"

export default abstract class AudioPlayer {
    public abstract get played(): number
    public abstract set played(value: number)
    public abstract get duration(): number

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
}