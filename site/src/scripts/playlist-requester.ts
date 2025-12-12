class PlaylistRequester {
    static async GetAllPlaylists() {
        if (Network.IsOnline()) {
            return await Network.GetAllPlaylists()
        }
        else {
            return await PlaylistDatabase.GetAllPlaylists()
        }
    }
    static async GetPlaylists(ids: id | id[]): Promise<Playlist[]> {
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
        let playlist
        if (PlaylistDatabase.Active) {
            playlist = (await PlaylistDatabase.GetPlaylists([id]))[0]
        }
        if (playlist === undefined) {
            playlist = await Network.GetPlaylist(id) as Playlist
        }
        return playlist
    }
}