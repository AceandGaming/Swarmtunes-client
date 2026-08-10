import type { Playlist } from "@ts/models/playlist"

class PlaylistStore {
    private playlists = new Map<string, Playlist>()

    public Init(playlists: Playlist[]) {
        for (const playlist of playlists) {
            this.playlists.set(playlist.id, playlist)
        }
    }

    public Get(id: id) {
        return this.playlists.get(id)
    }
    public GetAll() {
        return Array.from(this.playlists.values())
    }

    public Set(id: id, playlist: Playlist) {
        this.playlists.set(id, playlist)
    }
    public Delete(id: id) {
        this.playlists.delete(id)
    }

    public AddSongsToPlaylist(id: id, songIds: id[]) {
        const playlist = this.Get(id)

        if (playlist) {
            for (const songId of songIds) {
                playlist.AddSong(songId)
            }
            this.Set(id, playlist)
        }
    }

    public RemoveSongsToPlaylist(id: id, songIds: id[]) {
        const playlist = this.Get(id)

        if (playlist) {
            for (const songId of songIds) {
                playlist.RemoveSong(songId)
            }
            this.Set(id, playlist)
        }
    }
}

const playlistStore = new PlaylistStore()
export default playlistStore