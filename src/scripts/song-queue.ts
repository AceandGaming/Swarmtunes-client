import { CloneSongs } from "@ts/misc"
import type { Song } from "@ts/types/song"

export default class SongQueue {
    public get queue() {
        return this.songs.slice(this.queuePointer, this.songs.length)
    }
    public get currentSong(): Song | undefined {
        return this.songs[this.queuePointer]
    }

    private songs: Song[] = [];
    private loadedSongs: Song[] = [];
    private queuePointer: number = 0;

    public Next() {
        this.queuePointer++
        if (this.queuePointer > this.songs.length - 1) {
            this.queuePointer = 0
        }
        return this.currentSong
    }
    public Previous() {
        this.queuePointer--
        if (this.queuePointer < 0) {
            this.queuePointer = this.songs.length - 1
        }
        return this.currentSong
    }

    public PopulateQueue(
        songs: Song[],
        shuffle: boolean = false,
        currentSong?: Song,
    ) {
        this.LoadSongs(songs)
        this.UpdateQueue(shuffle)
        if (currentSong) {
            this.SkipTo(currentSong)
        }
    }
    public ReShuffle(shuffle: boolean = true) {
        const song = this.currentSong
        this.UpdateQueue(shuffle)
        if (song) {
            if (shuffle) {
                this.songs.splice(0, 0, song)
                this.SkipTo(song)
            } else {
                this.SkipTo(song)
            }
        }
    }
    public SkipTo(song: Song) {
        const index = this.songs.findIndex((s) => s.Id == song.Id)
        if (index == -1) {
            console.error("Song not found in queue")
            return
        }
        this.queuePointer = index
    }
    public Clear() {
        this.loadedSongs = []
        this.songs = []
        this.queuePointer = 0
    }

    private LoadSongs(songs: Song[]) {
        this.loadedSongs = CloneSongs(songs)
        this.queuePointer = 0
    }
    private UpdateQueue(shuffle: boolean = false) {
        if (!shuffle) {
            this.songs = CloneSongs(this.loadedSongs)
            return
        }
        const newQueue = []
        const songsRemaining = CloneSongs(this.loadedSongs)
        while (songsRemaining.length > 0) {
            const index = Math.floor(Math.random() * (songsRemaining.length - 1))
            newQueue.push(...songsRemaining.splice(index, 1))
        }
        this.songs = newQueue
    }
}