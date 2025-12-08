class PlaylistManager {
    static get playlists() {
        return Object.values(this.#playlists)
    }

    static #playlists = {}
    static error = false

    static async GetPlaylists() {
        try {
            const playlists = await Network.GetAllPlaylists()
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
        await playlist.GetSongs()
        PlaylistTab.OnPlaylistLoaded()
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
        const playlist = await this.LoadPlaylist(id)
        PlaylistView.Show(playlist)
    }
}