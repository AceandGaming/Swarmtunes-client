class SongRequester {
    static async GetSongs(ids: id | id[]): Promise<Song[]> {
        ids = EnsureArray(ids)
        let songs: Song[] = []
        let idsToRequest = ids
        if (SongDatabase.Active) {
            idsToRequest = await SongDatabase.SongsNotDownloaded(ids)
            songs = await SongDatabase.GetSongs(ids)
        }
        if (Network.IsOnline()) {
            songs = songs.concat(await Network.GetSong(idsToRequest) as Song[])
        }
        else {
            for (const id of idsToRequest) {
                songs.push(Song.CreateOfflineSong(id))
            }
        }
        return songs
    }
    static async GetSong(id: id): Promise<Song | undefined> {
        let song
        if (SongDatabase.Active) {
            song = (await SongDatabase.GetSongs([id]))[0]
        }
        if (song === undefined) {
            if (Network.IsOnline()) {
                song = await Network.GetSong(id) as Song
            }
            else {
                song = Song.CreateOfflineSong(id)
            }
        }
        return song
    }
    static async GetAudioUrl(id: id): Promise<string> {
        if (SongDatabase.Active) {
            const blob = await SongDatabase.GetAudio(id)
            if (blob !== undefined) {
                return URL.createObjectURL(blob)
            }
        }
        return Network.GetAudioURL(id)
    }
    static async GetAvailableSongs(ids: id[]): Promise<id[]> {
        if (Network.IsOnline()) {
            return ids
        }
        if (!SongDatabase.Active) {
            return []
        }
        return await SongDatabase.SongsDownloaded(ids)
    }
}