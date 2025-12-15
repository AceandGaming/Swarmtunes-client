class PlaylistRequester {
    private static networkQueue: Array<{ action: "add" | "remove" | "rename", playlist: id, data: any }> = []


    private static AddToQueue(action: "add" | "remove" | "rename", playlist: id, data: any) {
        this.networkQueue.push({ action, playlist, data })
    }
    private static CallAction(action: "add" | "remove" | "rename", playlist: id, data: any) {
        switch (action) {
            case "add":
                return Network.AddSongToPlaylist(playlist, data)
            case "remove":
                return Network.RemoveSongFromPlaylist(playlist, data)
            case "rename":
                return Network.RenamePlaylist(playlist, data)
        }
    }

    static async GetAllPlaylists() {
        if (Network.IsOnline()) {
            return await Network.GetAllPlaylists()
        }
        else if (PlaylistDatabase.Active) {
            return await PlaylistDatabase.GetAllPlaylists()
        }
        return []
    }
    static async GetPlaylists(ids: id | id[]): Promise<Playlist[]> {
        if (!(Array.isArray(ids) || typeof ids === "string")) {
            throw new TypeError("Invalid arguments")
        }

        ids = EnsureArray(ids)
        let playlists: Playlist[] = []
        let idsToRequest = ids
        if (PlaylistDatabase.Active) {
            idsToRequest = await PlaylistDatabase.PlaylistsNotDownloaded(ids)
            playlists = await PlaylistDatabase.GetPlaylists(ids)
        }
        playlists = playlists.concat(await Network.GetPlaylist(idsToRequest) as Playlist[])
        return playlists
    }
    static async GetPlaylist(id: id): Promise<Playlist | undefined> {
        if (typeof id !== "string") {
            throw new TypeError("Invalid arguments")
        }

        let playlist
        if (PlaylistDatabase.Active) {
            playlist = (await PlaylistDatabase.GetPlaylists([id]))[0]
        }
        if (playlist === undefined) {
            playlist = await Network.GetPlaylist(id) as Playlist
        }
        return playlist
    }
    static async DeletePlaylist(id: id) {
        if (typeof id !== "string") {
            throw new TypeError("Invalid arguments")
        }

        if (!Network.IsOnline()) {
            return
        }
        if (PlaylistDatabase.Active) {
            await PlaylistDatabase.RemovePlaylist(id)
        }
        await Network.DeletePlaylist(id)
    }
    static async AddSongToPlaylist(playlist: id, songs: id[]) {
        if (typeof playlist !== "string" || !Array.isArray(songs)) {
            throw new TypeError("Invalid arguments")
        }

        if (Network.IsOnline()) {
            await Network.AddSongToPlaylist(playlist, songs)
        }
        else {
            console.log("Adding playlist to queue")
            this.AddToQueue("add", playlist, songs)
        }
        if (PlaylistDatabase.Active) {
            await PlaylistDatabase.AddSongsToPlaylist(playlist, songs)
        }
    }
    static async RemoveSongFromPlaylist(playlist: id, songs: id[]) {
        if (typeof playlist !== "string" || !Array.isArray(songs)) {
            throw new TypeError("Invalid arguments")
        }

        if (Network.IsOnline()) {
            await Network.RemoveSongFromPlaylist(playlist, songs)
        }
        else {
            console.log("Adding playlist to queue")
            this.AddToQueue("remove", playlist, songs)
        }
        if (PlaylistDatabase.Active) {
            await PlaylistDatabase.RemoveSongsFromPlaylist(playlist, songs)
        }
    }
    static async RenamePlaylist(playlist: id, name: string) {
        if (typeof playlist !== "string" || typeof name !== "string") {
            throw new TypeError("Invalid arguments")
        }

        if (PlaylistDatabase.Active) {
            await PlaylistDatabase.RenamePlaylist(playlist, name)
        }
        if (Network.IsOnline()) {
            await Network.RenamePlaylist(playlist, name)
        }
        else {
            console.log("Adding playlist to queue")
            this.AddToQueue("rename", playlist, name)
        }
    }
    static async CheckNetworkQueue() {
        if (!Network.IsOnline()) {
            return
        }

        for (const action of this.networkQueue) {
            await this.CallAction(action.action, action.playlist, action.data)
        }
        this.networkQueue = []
    }
}