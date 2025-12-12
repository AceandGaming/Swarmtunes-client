class PlaylistDatabase {
    public static get Active(): boolean {
        return this.intialised && Network.IsLoggedIn()
    }

    private static database: IDBDatabase
    private static intialised = false

    public static async Initalise() {
        const db = indexedDB.open("DownloadedPlaylists", 1)
        db.onupgradeneeded = () => {
            this.database = db.result
            this.database.createObjectStore("playlists", { keyPath: "id" })
        }
        await Promiseify(db)
        this.database = db.result
        this.intialised = true
    }
    public static async AddPlaylist(playlists: Playlist | Playlist[]) {
        playlists = EnsureArray(playlists)
        for (const playlist of playlists) {
            if (playlist === undefined) {
                console.error("Playlist is undefined")
                return
            }
        }
        const playlistTransaction = this.database.transaction("playlists", "readwrite")
        const playlistStore = playlistTransaction.objectStore("playlists")

        for (const playlist of playlists) {
            playlistStore.put(playlist.ToJson())
        }

        await Promiseify(playlistTransaction)
        await Promiseify(playlistStore)
    }
    public static async GetPlaylists(ids: id[]): Promise<Playlist[]> {
        const playlistTransaction = this.database.transaction("playlists", "readonly")
        const playlistStore = playlistTransaction.objectStore("playlists")

        const playlists = []
        for (const id of ids) {
            const json = await Promiseify(playlistStore.get(id))
            if (json === undefined) {
                continue
            }
            playlists.push(new Playlist(json))
        }
        return playlists
    }

    public static async GetAllPlaylists(): Promise<Playlist[]> {
        const playlistTransaction = this.database.transaction("playlists", "readonly")
        const playlistStore = playlistTransaction.objectStore("playlists")

        const playlists = []
        const cursor = await Promiseify(playlistStore.openCursor())
        for await (const cursor of CursorIterator(playlistStore)) {
            const json = cursor.value
            if (json === undefined) {
                continue
            }
            playlists.push(new Playlist(json))
        }

        return playlists
    }
    public static async PlaylistsNotDownloaded(ids: id[]): Promise<id[]> {
        const playlistTransaction = this.database.transaction("playlists", "readonly")
        const playlistStore = playlistTransaction.objectStore("playlists")
        const missingIds = []
        for (const id of ids) {
            const count = await Promiseify(playlistStore.count(id))
            if (count === 0) {
                missingIds.push(id)
            }
        }
        return missingIds
    }
}

