class SongDatabase {
    public static get Active(): boolean {
        return this.intialised && Network.IsLoggedIn()
    }

    private static database: IDBDatabase
    private static intialised = false

    public static async Initalise() {
        const db = indexedDB.open("DownloadedSongs", 1)
        db.onupgradeneeded = () => {
            this.database = db.result
            this.database.createObjectStore("songs", { keyPath: "id" })
            this.database.createObjectStore("audio")
        }
        await Promiseify(db)
        this.database = db.result
        this.intialised = true
    }
    public static async AddSong(song: Song|Song[]) {
        const songs = EnsureArray(song)
        for (const song of songs) {
            if (song === undefined) {
                console.error("Song is undefined")
                return
            }
        }
        const audioData = []
        for (const song of songs) {
            audioData.push(await Network.GetSongAudio(song.id))
        }

        const songTransaction = this.database.transaction("songs", "readwrite")
        const songStore = songTransaction.objectStore("songs")

        const audioTransaction = this.database.transaction("audio", "readwrite")
        const audioStore = audioTransaction.objectStore("audio")


        for (const song of songs) {
            songStore.put(song.ToJson())
            audioStore.put(audioData[songs.indexOf(song)], song.id)
        }

        await Promiseify(songTransaction)
        await Promiseify(audioTransaction)
    }
    public static async GetSongs(ids: id[]): Promise<Song[]> {
        const songTransaction = this.database.transaction("songs", "readonly")
        const songStore = songTransaction.objectStore("songs")

        const songs = []
        for (const id of ids) {
            const json = await Promiseify(songStore.get(id))
            if (json === undefined) {
                continue
            }
            songs.push(new Song(json))
        }
        return songs
    }
    public static async GetAudio(id: id): Promise<Blob|undefined> {
        const audioTransaction = this.database.transaction("audio", "readonly")
        const audioStore = audioTransaction.objectStore("audio")
        const audio = await Promiseify(audioStore.get(id))
        return audio
    }
    public static async SongsNotDownloaded(ids: id[]): Promise<id[]> {
        const songTransaction = this.database.transaction("songs", "readonly")
        const songStore = songTransaction.objectStore("songs")
        const missingIds = []
        for (const id of ids) {
            const count = await Promiseify(songStore.count(id))
            if (count === 0) {
                missingIds.push(id)
            }
        }
        return missingIds
    }
}

