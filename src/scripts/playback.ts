import { AudioBase, AudioPlayer, SwarmFM } from "@ts/audio";
import type { Song } from "@ts/types";
import { SongQueue } from "@ts/song-queue";
import { MetadataDisplay } from "./metadata-display";

export class PlaybackController {
    private static get HasControl(): AudioBase | null {
        if (this.SwarmFM.HasControl) {
            return this.SwarmFM
        }
        else if (this.Audio.HasControl) {
            return this.Audio
        }
        // else if (this.Youtube.HasControl) {
        //     return this.Youtube
        // }
        return null
    }
    public static get CurrentSong(): Song | undefined {
        if (this.Audio.HasControl) {
            return this.Audio.CurrentSong
        }
        // else if (this.Youtube.HasControl) {
        //     return this.Youtube.CurrentSong
        // }
        return undefined
    }
    private static get Audio() {
        return this.audio
    }
    private static get SwarmFM() {
        return this.swarmfm
    }
    private static get Youtube() {
        //return this.youtube
        return null
    }

    public static get Playing(): boolean {
        return this.HasControl ? !this.HasControl.Paused : false
    }
    public static set Playing(value: boolean) {
        if (value) {
            this.Play()
        }
        else {
            this.Pause()
        }
    }

    public static get Shuffle(): boolean {
        return localStorage.getItem("suffle") === "true"
    }
    public static set Shuffle(value: boolean) {
        try {
            localStorage.setItem("suffle", value.toString())
        }
        catch (e) {
            console.error("Failed to save suffle state", e)
        }
        this.songQueue.ReShuffle(value)
        this.CallCallbacks("onShuffle", value)
        this.CallCallbacks("onQueueChange", this.songQueue.Queue)
    }



    private static callbacks: { [key: string]: any[] } = {}
    private static audio = new AudioPlayer()
    private static swarmfm = new SwarmFM()
    private static songQueue = new SongQueue()
    //private static youtube = new YoutubePlayer()

    public static OnTimeUpdate(callback: (played: number, duration: number, loaded: number) => void) {
        this.audio.OnTimeUpdate(callback)
        this.swarmfm.OnTimeUpdate(callback)
    }

    private static CallCallbacks(name: string, prams: any) {
        if (this.callbacks[name]) {
            this.callbacks[name].forEach((callback: any) => callback(prams))
        }
    }
    public static AddCallback(name: string, callback: any) {
        if (!this.callbacks[name]) {
            this.callbacks[name] = []
        }
        this.callbacks[name].push(callback)
    }

    public static NextSong() {
        const song = this.songQueue.Next()
        this.CallCallbacks("onQueueChange", this.songQueue.Queue)
        this.Play(song)
    }
    public static PreviousSong() {
        const song = this.songQueue.Previous()
        this.CallCallbacks("onQueueChange", this.songQueue.Queue)
        this.Play(song)
    }
    public static PlaySonglist(songlist: Song[], currentSong?: Song) {
        this.songQueue.PopulateQueue(songlist, this.Shuffle, currentSong)
        this.CallCallbacks("onQueueChange", this.songQueue.Queue)
        currentSong = currentSong || this.songQueue.CurrentSong
        if (!currentSong) {
            console.warn("No current song")
            return
        }
        this.Play(currentSong)
    }

    public static Play(song?: Song) {
        if (song) {
            // if (song.YoutubeId) {
            //     this.Youtube.Play(song)
            // }
            // else {
            //     this.Audio.Play(song)
            // }
            this.Audio.Play(song)
            this.CallCallbacks("onSongChange", song)
        }
        else {
            this.HasControl?.Play()
        }
        const metadata = this.HasControl?.Metadata
        if (!metadata) {
            return
        }
        MetadataDisplay.Display(this.HasControl.Metadata)
        this.CallCallbacks("onMetadataChange", metadata)

        this.CallCallbacks("onPlay", true)
    }
    public static PlaySwarmFM() {
        this.SwarmFM.Play()
        if (this.SwarmFM.Metadata) {
            MetadataDisplay.Display(this.SwarmFM.Metadata)
            this.CallCallbacks("onMetadataChange", this.SwarmFM.Metadata)
        }
        this.CallCallbacks("onPlay", true)
    }
    public static Pause() {
        this.HasControl?.Pause()
        this.CallCallbacks("onPlay", false)
    }

    public static Seek(fraction: number) {
        const audio = this.HasControl
        if (audio instanceof AudioPlayer) {
            audio.Seek(fraction)
        }
    }
}