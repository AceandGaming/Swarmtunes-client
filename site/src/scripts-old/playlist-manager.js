class PlaylistManager {
    static get playlists() {
        return Object.values(this.#playlists)
    }

    static #playlists = {}

    static async GetPlaylists() {
        const playlists = await PlaylistRequester.GetAllPlaylists()
        for (const playlist of playlists) {
            this.#playlists[playlist.id] = playlist
        }
        if (Network.IsOnline && PlaylistDatabase.Active) {
            PlaylistDatabase.AddPlaylist(playlists)
        }
    }
    static GetPlaylist(id) {
        const playlist = this.#playlists[id]
        if (playlist === undefined) {
            console.error("Playlist not found")
            return
        }
        return playlist
    }
    static async LoadPlaylist(id) {
        const playlist = this.#playlists[id]
        const wasLoaded = playlist.IsLoaded
        await playlist.GetSongs()
        if (!wasLoaded) {
            PlaylistTab.OnPlaylistLoaded()
        }
        return playlist
    }
    static AddPlaylist(playlist) {
        this.#playlists[playlist.id] = playlist
    }
    static RemovePlaylist(id) {
        delete this.#playlists[id]
        PlaylistRequester.DeletePlaylist(id)
        PlaylistTab.Populate()
    }
    static async DisplayPlaylist(id) {
        MediaView.ShowLoading()
        const playlist = this.GetPlaylist(id)
        await PlaylistView.Show(playlist)
        PlaylistTab.OnPlaylistLoaded()
    }
}