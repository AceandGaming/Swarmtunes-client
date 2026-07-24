import type AudioPlayer from "@ts/audio/audio"
import type { Song } from "@ts/types/song"
import SongRequester from "@ts/song-requester"

export default class YoutubePlayer implements AudioPlayer {
    public get played(): number {
        throw new Error("Method not implemented.")
    }
    public set played(value: number) {
        throw new Error("Method not implemented.")
    }
    public get duration(): number {
        throw new Error("Method not implemented.")
    }

    constructor(
        onPlay: () => void,
        onPause: () => void,
        onUpdate: () => void,
        onEnded: () => void
    ) { }

    public Load(song: Song): Promise<void> | void {
        if (!song.YoutubeId) {
            throw new Error("Song has no youtube id")
        }
    }
    public Play(): void {
        throw new Error("Method not implemented.")
    }
    public Pause(): void {
        throw new Error("Method not implemented.")
    }
    public Destroy(): Promise<void> | void {
        throw new Error("Method not implemented.")
    }

}