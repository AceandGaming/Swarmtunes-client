class PlaylistManager {
    static get playlists() {
        return Object.values(this.#playlists)
    }

    static #playlists = {}
    static error = false

    static async GetPlaylists() {
        try {
            const playlists = await PlaylistRequester.GetAllPlaylists()
            for (const playlist of playlists) {
                this.#playlists[playlist.id] = playlist
            }
        }
        catch (error) {
            console.error(error)
            this.error = true
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
        Network.DeletePlaylist(id)
        PlaylistTab.Populate()
    }
    static async DisplayPlaylist(id) {
        MediaView.ShowLoading()
        const playlist = this.GetPlaylist(id)
        await PlaylistView.Show(playlist)
        PlaylistTab.OnPlaylistLoaded()
    }
}