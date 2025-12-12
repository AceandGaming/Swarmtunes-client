class SongRequester {
    static async GetSongs(ids: id | id[]): Promise<Song[]> {
        ids = EnsureArray(ids)
        let songs: Song[] = []
        let idsToRequest = ids
        if (SongDatabase.Active) {
            idsToRequest = await SongDatabase.SongsNotDownloaded(ids)
            songs = await SongDatabase.GetSongs(ids)
        }
        songs = songs.concat(await Network.GetSong(idsToRequest) as Song[])
        return songs
    }
    static async GetSong(id: id): Promise<Song | undefined> {
        let song
        if (SongDatabase.Active) {
            song = (await SongDatabase.GetSongs([id]))[0]
        }
        if (song === undefined) {
            song = await Network.GetSong(id) as Song
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
}