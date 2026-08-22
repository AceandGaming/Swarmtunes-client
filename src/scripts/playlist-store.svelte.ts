import type { Playlist } from "@ts/models/playlist"
import { SvelteMap } from "svelte/reactivity"
class PlaylistStore {
    private playlists = new SvelteMap<string, Playlist>()
    private playlistArray = $derived(Array.from(this.playlists.values()))

    public Init(playlists: Playlist[]) {
        for (const playlist of playlists) {
            this.playlists.set(playlist.id, playlist)
        }
    }

    public Get(id: id) {
        return this.playlists.get(id)
    }
    public GetAll() {
        return this.playlistArray
    }

    public Set(id: id, playlist: Playlist) {
        this.playlists.set(id, playlist)
    }
    public Delete(id: id) {
        this.playlists.delete(id)
    }

    public async AddSongsToPlaylist(id: id, songIds: id[]) {
        const playlist = this.Get(id)
        if (!playlist) {
            return
        }

        await playlist.LoadSongs()

        for (const songId of songIds) {
            playlist.AddSong(songId)
        }
        this.Set(id, playlist)
    }

    public async RemoveSongsToPlaylist(id: id, songIds: id[]) {
        const playlist = this.Get(id)
        if (!playlist) {
            return
        }

        await playlist.LoadSongs()

        for (const songId of songIds) {
            playlist.RemoveSong(songId)
        }
        this.Set(id, playlist)
    }

    public Clear() {
        this.playlists.clear()
    }
}

const playlistStore = new PlaylistStore()
export default playlistStore