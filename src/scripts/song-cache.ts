import type { Song } from "@ts/models/song"

class SongCache {
    private songs = new Map<string, Song>()

    public Get(id: id) {
        return this.songs.get(id)
    }
    public Set(id: id, song: Song) {
        this.songs.set(id, song)
    }
}

const songCache = new SongCache()
export default songCache