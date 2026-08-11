import { GetSongs, GetSong, GetSongAudioUrl } from "@ts/api/song"
import { Song } from "@ts/models/song"
import SongCache from "@ts/song-cache"

export default class SongProvider {
    public static async GetMany(ids: id[], retainOrder = false): Promise<Song[]> {
        if (ids.length == 0) {
            return []
        }

        const songs = []
        const missing = []
        for (const id of ids) {
            const song = SongCache.Get(id)
            if (song) {
                songs.push(song)
            } else {
                missing.push(id)
            }
        }

        if (missing.length > 0) {
            const newSongs = await GetSongs(missing)
            for (const song of newSongs) {
                SongCache.Set(song.id, song)
                songs.push(song)
            }
        }

        console.log(`Loaded ${songs.length}/${ids.length}, Fetched ${missing.length}, Cached ${ids.length - missing.length}`)

        if (!retainOrder) {
            return songs.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id))
        }

        return songs
    }
    public static async Get(id: id): Promise<Song | undefined> {
        return (await this.GetMany([id]))[0]
    }

    public static async GetAudioUrl(id: id): Promise<string> {
        return GetSongAudioUrl(id)
    }
}