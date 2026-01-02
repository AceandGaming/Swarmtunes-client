class SongQueue {
    static get currentSong() {
        return this.#songQueue[this.#queuePointer]
    }
    static set currentSong(song) {
        if (song === undefined) {
            this.#queuePointer = 0
            return
        }
        if (this.#suffle) {
            this.SpliceSong(song)
        }
        else {
            this.SkipSong(song)
        }
    }
    static get firstSong() {
        return this.#songQueue[0]
    }
    static get songs() {
        return this.#songQueue
    }
    static get nextSongs() {
        return this.#songQueue.slice(this.#queuePointer)
    }
    static set suffleSongs(value) {
        localStorage.setItem("suffle", value)
        const song = this.currentSong
        this.UpdateQueue()
        for (const callback of this.#callbacks) {
            callback(value)
        }
        this.currentSong = song
    }
    static get suffleSongs() {
        return this.#suffle
    }
    static get songCount() {
        return this.#songQueue.length
    }
    static get #suffle() {
        return localStorage.getItem("suffle") == "true"
    }

    static #loadedSongs = []
    static #songQueue = []
    static #queuePointer = 0
    static #callbacks = []

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
            AudioPlayer.instance.Pause()
            return
        }
        PlaybackController.PlaySong(song)
        NowPlaying.Update()
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
    static PlayPreviousSong() {
        const song = this.GetPreviousSong()
        if (song === null) {
            AudioPlayer.Pause()
            return
        }
        PlaybackController.PlaySong(song)
        NowPlaying.Update()
    }
    static ClearSongQueue() {
        this.LoadSingleSong(this.currentSong)
    }
    static LoadSongs(songs) {
        this.#loadedSongs = CloneSongs(songs)
        PlayState.Update({ songIds: GetidsFromSongList(songs) })
    }
    static LoadSingleSong(song) {
        this.LoadSongs([song.Copy()])
        this.#UnshuffleQueue()
        NowPlaying.source = "none"
        NowPlaying.Update()
        PlayState.Update({ currentSong: song.id })
    }
    static UpdateQueue(currentSong) {
        if (this.#suffle) {
            this.#ShuffleQueue()
        }
        else {
            this.#UnshuffleQueue()
        }
        if (currentSong) {
            this.currentSong = currentSong
        }
        NowPlaying.Update()
    }
    static PassiveUpdate() {
        if (this.#suffle) {
            this.#ShuffleQueue()
        }
        else {
            this.#UnshuffleQueue()
        }
    }
    static PlayNow(songs) {
        this.LoadSongs(songs)
        this.#UnshuffleQueue()
        this.currentSong = songs[0]
        NowPlaying.Update()
    }
    static AppendSong(song) {
        this.#songQueue.push(song)
        NowPlaying.Update()
    }
    static GetSong(id) {
        for (let i = 0; i < this.#loadedSongs.length; i++) {
            if (this.#loadedSongs[i].id === id) {
                return this.#loadedSongs[i]
            }
        }
    }
    static RemoveSong(id) {
        for (let i = 0; i < this.#songQueue.length; i++) {
            if (this.#songQueue[i].id === id) {
                this.#songQueue.splice(i, 1)
                if (this.#queuePointer === i) {
                    PlaybackController.PlaySong(this.currentSong)
                }
                return
            }
        }
        console.warn("Song not found in queue")
    }
    static OnQueueOrderChange(newOrder) {
        const newQueue = []
        for (const id of newOrder) {
            newQueue.push(this.GetSong(id))
        }
        if (newQueue[0].id !== this.currentSong.id) {
            PlaybackController.PlaySong(newQueue[0])
        }
        const previusSongs = this.#songQueue.slice(0, this.#queuePointer)
        newQueue.splice(0, 0, ...previusSongs)

        this.#songQueue = CloneSongs(newQueue)
    }

    static SkipSong(song) {
        for (let i = 0; i < this.#songQueue.length; i++) {
            if (this.#songQueue[i].id === song.id) {
                this.#queuePointer = i
                return
            }
        }
    }
    static SpliceSong(song) {
        if (song === undefined) {
            return
        }
        const songQueue = this.#songQueue
        for (let i = 0; i < songQueue.length; i++) {
            if (songQueue[i].id === song.id) {
                songQueue.splice(i, 1)
                songQueue.splice(0, 0, song)
            }
        }
    }
    static #ShuffleQueue() {
        const songs = CloneSongs(this.#loadedSongs)
        const newQueue = []
        while (songs.length > 0) {
            const index = Math.floor(Math.random(0) * (songs.length - 1) + 0.5)
            newQueue.push(songs[index])
            songs.splice(index, 1)
        }
        this.#songQueue = CloneSongs(newQueue)
        this.#queuePointer = 0
    }
    static #UnshuffleQueue() {
        this.#songQueue = CloneSongs(this.#loadedSongs)
    }

    static OnShuffleChange(callback) {
        this.#callbacks.push(callback)
    }
}