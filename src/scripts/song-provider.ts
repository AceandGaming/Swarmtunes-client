import { GetSongs, GetSong, GetSongAudioUrl } from "@ts/api/song"
import { Song } from "@ts/models/song"
import SongCache from "@ts/song-cache"
import * as SongDatabase from "@ts/song-downloads"

type AudioSource = {
    readonly url: string
    Dispose(): void
}

export default class SongProvider {
    public static async GetMany(ids: id[], retainOrder = false): Promise<Song[]> {
        if (ids.length == 0) {
            return []
        }

        const songs = []
        let missing = []
        let inDatabase: id[] = []

        for (const id of ids) {
            const song = SongCache.Get(id)
            if (song) {
                songs.push(song)
            } else {
                missing.push(id)
            }
        }

        if (missing.length > 0) {
            inDatabase = await SongDatabase.GetExists(missing)
            if (inDatabase.length > 0) {
                const newSongs = await SongDatabase.GetMany(inDatabase)
                for (const song of newSongs) {
                    SongCache.Set(song.id, song)
                    songs.push(song)
                }
            }

            missing = missing.filter(id => !inDatabase.includes(id))
        }

        if (missing.length > 0) {
            const newSongs = await GetSongs(missing)

            for (const song of newSongs) {
                SongCache.Set(song.id, song)
                songs.push(song)
            }
        }

        console.log(`Loaded ${songs.length}/${ids.length}, Fetched ${missing.length}, Cached ${ids.length - missing.length - inDatabase.length}, In Database ${inDatabase.length ?? 0}`)

        if (retainOrder) {
            return songs.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id))
        }

        return songs
    }
    public static async Get(id: id): Promise<Song | undefined> {
        return (await this.GetMany([id]))[0]
    }

    public static async GetAudio(id: id): Promise<AudioSource> {
        const audio = await SongDatabase.GetSongAudio(id)
        if (audio) {
            const url = URL.createObjectURL(audio)
            return {
                url,
                Dispose: () => {
                    URL.revokeObjectURL(url)
                }
            }
        }
        return {
            url: GetSongAudioUrl(id),
            Dispose: () => { }
        }
    }
}