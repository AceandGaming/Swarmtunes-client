import Network from "@ts/network"
import PlaylistDatabase from "@ts/playlist-db"
import { PlaylistRequester } from "@ts/playlist-requester"
import type { Playlist } from "@ts/types/playlist"
import { MediaView, PlaylistView } from "@ts/ui/content/media-view"
import PlaylistTab from "@ts/ui/content/playlist-tab"

export default class PlaylistManager {
    static get playlists() {
        return Object.values(this.#playlists)
    }

    static #playlists: { [id: string]: Playlist } = {}

    static async GetPlaylists() {
        const playlists = await PlaylistRequester.GetAllPlaylists()
        for (const playlist of playlists) {
            this.#playlists[playlist.Id] = playlist
        }
        if (Network.IsOnline() && PlaylistDatabase.Active) {
            PlaylistDatabase.AddPlaylist(playlists)
        }
    }
    static GetPlaylist(id: id) {
        const playlist = this.#playlists[id]
        if (playlist === undefined) {
            throw new Error("Playlist not found")
        }
        return playlist
    }
    static async LoadPlaylist(id: id) {
        const playlist = this.#playlists[id]
        const wasLoaded = playlist.IsLoaded
        await playlist.GetSongs()
        if (!wasLoaded) {
            PlaylistTab.OnPlaylistLoaded()
        }
        return playlist
    }
    static AddPlaylist(playlist: Playlist) {
        this.#playlists[playlist.Id] = playlist
    }
    static RemovePlaylist(id: id) {
        delete this.#playlists[id]
        PlaylistRequester.DeletePlaylist(id)
        PlaylistTab.Populate()
    }
    static async DisplayPlaylist(id: id) {
        MediaView.ShowLoading()
        const playlist = this.GetPlaylist(id)
        await PlaylistView.Show(playlist)
        PlaylistTab.OnPlaylistLoaded()
    }
}