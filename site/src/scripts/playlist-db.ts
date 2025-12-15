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
        if (!this.Active) {
            throw new Error("Database not Active")
        }
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
        if (!this.Active) {
            throw new Error("Database not Active")
        }

        const transaction = this.database.transaction("playlists", "readonly")
        const store = transaction.objectStore("playlists")

        const playlists: Playlist[] = []

        for (const id of ids) {
            const json = await Promiseify(store.get(id))
            if (json !== undefined) {
                playlists.push(new Playlist(json))
            }
        }

        await PromiseifyTransaction(transaction)
        return playlists
    }

    public static async RemovePlaylist(playlistId: id) {
        if (!this.Active) {
            throw new Error("Database not Active")
        }
        const playlistTransaction = this.database.transaction("playlists", "readwrite")
        const playlistStore = playlistTransaction.objectStore("playlists")
        await Promiseify(playlistStore.delete(playlistId))
    }

    public static async GetAllPlaylists(): Promise<Playlist[]> {
        if (!this.Active) {
            throw new Error("Database not Active")
        }
        const playlistTransaction = this.database.transaction("playlists", "readonly")
        const playlistStore = playlistTransaction.objectStore("playlists")

        const playlists = []
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
        if (!this.Active) {
            throw new Error("Database not Active")
        }
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
    public static async AddSongsToPlaylist(playlistId: id, ids: id[]) {
        if (!this.Active) {
            throw new Error("Database not Active")
        }
        const playlists = await this.GetPlaylists([playlistId])
        const playlist = playlists[0]
        if (playlist === undefined) {
            throw new Error("Playlist not found")
        }
        playlist.AddIds(ids)
        await this.AddPlaylist(playlist)
    }
    public static async RemoveSongsFromPlaylist(playlistId: id, ids: id[]) {
        if (!this.Active) {
            throw new Error("Database not Active")
        }
        const playlists = await this.GetPlaylists([playlistId])
        const playlist = playlists[0]
        if (playlist === undefined) {
            throw new Error("Playlist not found")
        }
        playlist.RemoveIds(ids)
        await this.AddPlaylist(playlist)
    }
    public static async RenamePlaylist(playlistId: id, name: string) {
        if (!this.Active) {
            throw new Error("Database not Active")
        }
        const playlists = await this.GetPlaylists([playlistId])
        const playlist = playlists[0]
        if (playlist === undefined) {
            throw new Error("Playlist not found")
        }
        playlist.Title = name
        await this.AddPlaylist(playlist)
    }
}

