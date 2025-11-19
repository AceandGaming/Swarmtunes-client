
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
                this.#playlists[playlist.uuid] = playlist
            }
        }
        catch (error) {
            console.error(error)
            this.error = true
        }
    }
    static GetPlaylist(uuid) {
        const playlist = this.#playlists[uuid]
        if (playlist === undefined) {
            console.error("Playlist not found")
            return
        }
        return playlist
    }
    static async LoadPlaylist(uuid) {
        const playlist = this.#playlists[uuid]
        await playlist.GetSongs()
        PlaylistTab.OnPlaylistLoaded()
    }
    static AddPlaylist(playlist) {
        this.#playlists[playlist.uuid] = playlist
    }
    static RemovePlaylist(uuid) {
        delete this.#playlists[uuid]
        Network.DeletePlaylist(uuid)
        PlaylistTab.Populate()
    }
    static async DisplayPlaylist(uuid) {
        const playlist = this.#playlists[uuid]
        PlaylistView.Show(playlist)
    }
}

function OnPlaylistClick(event) {
    const uuid = event.target.dataset.uuid
    PlaylistManager.DisplayPlaylist(uuid)
}