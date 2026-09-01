import { Song } from "@ts/models/song"
import { Database } from "@ts/indexd-db"
import { GetSongAudioUrl as NetworkAudioUrl } from "@ts/api/song"
import { SvelteSet } from "svelte/reactivity"

type Item = {
    id: string,
    song: Song,
    audio: Blob
}


const db = new Database<Item>("songs")
const downloadedSongs = new SvelteSet<string>([])

export function GetDownloads() {
    return downloadedSongs
}

db.Open()
db.WaitForOpen().then(async () => {
    const ids = await db.GetAllIds()
    ids.forEach(id => downloadedSongs.add(id))
})

export async function GetSong(id: id): Promise<Song | undefined> {
    await db.WaitForOpen()

    const item = await db.Get(id)
    if (!item) {
        return
    }
    return Song.From(item.song)
}
export async function GetSongAudioUrl(id: id): Promise<string | undefined> {
    await db.WaitForOpen()

    const item = await db.Get(id)
    if (!item) {
        return
    }
    return URL.createObjectURL(item.audio)
}

export async function GetMany(ids: id[]): Promise<Song[]> {
    await db.WaitForOpen()

    const items = await db.GetMany(ids)
    return items.map(item => Song.From(item.song))
}
export async function GetExists(ids: id[]): Promise<string[]> {
    await db.WaitForOpen()
    const exist = await db.Exists(ids)
    return exist
}

export async function Download(songs: Song[]) {
    await db.WaitForOpen()

    const exist = await db.Exists(songs.map(song => song.id))
    const missing = songs.filter(song => !exist.includes(song.id))

    async function download(song: Song) {
        const response = await fetch(NetworkAudioUrl(song.id))

        if (!response.ok) {
            throw new Error(
                `Failed to download ${song.id}: ${response.status}`
            )
        }

        await db.Put({
            id: song.id,
            song,
            audio: await response.blob()
        })

        downloadedSongs.add(song.id)
    }

    await Promise.allSettled(missing.map(download))
}