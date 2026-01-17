class SongQueue {
    public static get Queue() {
        return this.queue.splice(this.queuePointer, this.queue.length - 1)
    }
    public static get CurrentSong() {
        return this.queue[this.queuePointer]
    }

    private static songs: Song[] = []
    private static queue: Song[] = []
    private static queuePointer: number = 0

    public static Next() {
        this.queuePointer++
        if (this.queuePointer > this.queue.length - 1) {
            this.queuePointer = 0
        }
        return this.CurrentSong
    }
    public static Previous() {
        this.queuePointer--
        if (this.queuePointer < 0) {
            this.queuePointer = this.queue.length - 1
        }
        return this.CurrentSong
    }

    public static PopulateQueue(songs: Song[], shuffle: boolean = false, currentSong?: Song) {
        this.LoadSongs(songs)
        this.UpdateQueue(shuffle)
        if (currentSong) {
            this.SkipTo(currentSong)
        }
    }
    public static SkipTo(song: Song) {
        const index = this.queue.indexOf(song)
        if (index == -1) {
            console.error("Song not found in queue")
            return
        }
        this.queuePointer = index
    }
    public static Clear() {
        this.songs = []
        this.queue = []
        this.queuePointer = 0
    }

    private static LoadSongs(songs: Song[]) {
        this.songs = CopySongs(songs)
        this.queuePointer = 0
    }
    private static UpdateQueue(shuffle: boolean = false) {
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