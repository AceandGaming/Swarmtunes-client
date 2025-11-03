class SongQueue {
    static get currentSong() {
        return this.#songQueue[this.#queuePointer]
    }
    static set currentSong(song) {
        if (this.#suffle) {
            this.SpliceSong(song)
        }
        else {
            this.SkipSong(song)
        }
    }
    static get songs() {
        return this.#songQueue
    }
    static get nextSongs() {
        return this.#songQueue.slice(this.#queuePointer)
    }
    static set suffleSongs(value) {
        this.#suffle = value
        this.UpdateQueue()
    }
    static get suffleSongs() {
        return this.#suffle
    }
    static get songCount() {
        return this.#songQueue.length
    }

    static #loadedSongs = []
    static #songQueue = []
    static #queuePointer = 0
    static #suffle = false

    static GetNextSong() {
        if (this.#songQueue.length == 0) {
            return
        }
        this.#queuePointer++
        if (this.#queuePointer >= this.#songQueue.length) {
            if (this.#suffle) {
                this.#ShuffleQueue()
            }
            this.#queuePointer = 0
        }
        return this.#songQueue[this.#queuePointer]
    }
    static PlayNextSong() {
        const song = this.GetNextSong()
        if (song === null) {
            Audio.Pause()
            return
        }
        Audio.Play(song)
        UpdateNowPlaying()
    }
    static GetPreviousSong() {
        if (this.#songQueue.length == 0) {
            return
        }
        this.#queuePointer--
        if (this.#queuePointer < 0) {
            this.#queuePointer = this.#songQueue.length - 1
        }
        return this.#songQueue[this.#queuePointer]
    }
    static ClearSongQueue() {
        this.#songQueue = []
        this.#queuePointer = 0
        this.#loadedSongs = []
    }
    static LoadSongs(songs) {
        this.#loadedSongs = CloneSongs(songs)
    }
    static LoadSingleSong(song) {
        this.#loadedSongs = [song]
        this.currentSong = song
        this.#UnshuffleQueue()
        UpdateNowPlaying()
    }
    static UpdateQueue() {
        if (this.#suffle) {
            this.#ShuffleQueue()
        }
        else {
            this.#UnshuffleQueue()
        }
    }
    static PlayNow(songs) {
        this.#songQueue.splice(this.#queuePointer, 0, ...songs)
        UpdateNowPlaying()
    }
    static GetSong(uuid) {
        for (let i = 0; i < this.#songQueue.length; i++) {
            if (this.#songQueue[i].uuid === uuid) {
                return this.#songQueue[i]
            }
        }
    }
    static RemoveSong(uuid) {
        for (let i = 0; i < this.#songQueue.length; i++) {
            if (this.#songQueue[i].uuid === uuid) {
                this.#songQueue.splice(i, 1)
                if (this.#queuePointer === i) {
                    Audio.Play(this.currentSong)
                }
                return
            }
        }
        console.warn("Song not found in queue")
    }
    static OnQueueOrderChange(newOrder) {
        const newQueue = []
        for (const uuid of newOrder) {
            newQueue.push(this.GetSong(uuid))
        }
        if (newQueue[0].uuid !== this.currentSong.uuid) {
            Audio.Play(newQueue[0])
        }
        const previusSongs = this.#songQueue.slice(0, this.#queuePointer)
        newQueue.splice(0, 0, ...previusSongs)

        this.#songQueue = CloneSongs(newQueue)
    }

    static SkipSong(song) {
        for (let i = 0; i < this.#songQueue.length; i++) {
            if (this.#songQueue[i].uuid === song.uuid) {
                this.#queuePointer = i
                return
            }
        }
        console.warn("Song not found in queue")
        this.#queuePointer = 0
    }
    static SpliceSong(song) {
        if (song === undefined) {
            return
        }
        const songQueue = this.#songQueue
        for (let i = 0; i < songQueue.length; i++) {
            if (songQueue[i].uuid === song.uuid) {
                songQueue.splice(i, 1)
                songQueue.splice(0, 0, song)
            }
        }
    }
    static #ShuffleQueue() {
        const currentSong = this.currentSong
        const songs = CloneSongs(this.#loadedSongs)
        const newQueue = []
        while (songs.length > 0) {
            const index = Math.floor(Math.random(0) * (songs.length - 1) + 0.5)
            newQueue.push(songs[index])
            songs.splice(index, 1)
        }
        this.#songQueue = CloneSongs(newQueue)
        this.#queuePointer = 0
        this.SpliceSong(currentSong)
    }
    static #UnshuffleQueue() {
        const currentSong = this.currentSong
        this.#songQueue = CloneSongs(this.#loadedSongs)
        if (currentSong !== undefined) {
            this.SkipSong(currentSong)
        }
    }
}