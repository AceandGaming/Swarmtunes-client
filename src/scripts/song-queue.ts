import { Song, CopySongs } from "@ts/types"


export class SongQueue {
    public get Queue() {
        return this.queue.splice(this.queuePointer, this.queue.length - 1)
    }
    public get CurrentSong() {
        return this.queue[this.queuePointer]
    }

    private songs: Song[] = []
    private queue: Song[] = []
    private queuePointer: number = 0

    public Next() {
        this.queuePointer++
        if (this.queuePointer > this.queue.length - 1) {
            this.queuePointer = 0
        }
        return this.CurrentSong
    }
    public Previous() {
        this.queuePointer--
        if (this.queuePointer < 0) {
            this.queuePointer = this.queue.length - 1
        }
        return this.CurrentSong
    }

    public PopulateQueue(songs: Song[], shuffle: boolean = false, currentSong?: Song) {
        this.LoadSongs(songs)
        this.UpdateQueue(shuffle)
        if (currentSong) {
            this.SkipTo(currentSong)
        }
    }
    public SkipTo(song: Song) {
        const index = this.queue.indexOf(song)
        if (index == -1) {
            console.error("Song not found in queue")
            return
        }
        this.queuePointer = index
    }
    public Clear() {
        this.songs = []
        this.queue = []
        this.queuePointer = 0
    }

    private LoadSongs(songs: Song[]) {
        this.songs = CopySongs(songs)
        this.queuePointer = 0
    }
    private UpdateQueue(shuffle: boolean = false) {
        if (!shuffle) {
            this.queue = CopySongs(this.songs)
            return
        }
        const newQueue = []
        const songsRemaining = CopySongs(this.songs)
        while (songsRemaining.length > 0) {
            const index = Math.floor(Math.random() * (songsRemaining.length - 1))
            newQueue.push(songsRemaining.splice(index, 1))
        }
    }
}