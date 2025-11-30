class SongRequester {
    static async GetSongs(ids) {
        ids = EnsureArray(ids)
        let songs = []
        let idsToRequest = ids
        if (SongDatabase.Active) {
            idsToRequest = await SongDatabase.SongsNotDownloaded(ids)
            songs = await SongDatabase.GetSongs(ids)
        }
        songs = songs.concat(await Network.GetSong(idsToRequest))
        return songs
    }
    static async GetAudioUrl(id) {
        if (SongDatabase.Active) {
            const blob = await SongDatabase.GetAudio(id)
            if (blob !== undefined) {
                return URL.createObjectURL(blob)
            }
        }
        return Network.GetAudioURL(id)
    }
}