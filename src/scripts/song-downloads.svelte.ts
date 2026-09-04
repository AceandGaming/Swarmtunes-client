import { Song } from "@ts/models/song"
import { Database } from "@ts/indexd-db.svelte"
import { GetSongAudioUrl as NetworkAudioUrl } from "@ts/api/song"
import { SvelteSet } from "svelte/reactivity"
import { auth } from "@ts/login.svelte"

type Item = {
    id: string,
    song: Song,
    audio: Blob
}

$effect.root(() => {
    $effect(() => {
        if (!auth.initialized) {
            return
        }

        if (auth.user) {
            async function update() {
                await db.WaitForOpen()
                const ids = await db.GetAllIds()
                if (!auth.user) {
                    return
                }

                downloadedSongs = new SvelteSet(ids)
            }
            update()
        }
        else {
            downloadedSongs.clear()
        }
    })
})

const db = new Database<Item>("songs", true)
let downloadedSongs = new SvelteSet<string>([])

export function GetDownloads() {
    return downloadedSongs
}

db.Open()

export async function GetSong(id: id): Promise<Song | undefined> {
    await db.WaitForOpen()

    const item = await db.Get(id)
    if (!item) {
        return
    }
    return Song.From(item.song)
}
export async function GetSongAudio(id: id): Promise<Blob | undefined> {
    await db.WaitForOpen()

    const item = await db.Get(id)
    if (!item) {
        return
    }
    return item.audio
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

async function Download(songs: Song[]) {
    await db.WaitForOpen()

    const exist = await db.Exists(songs.map(song => song.id))
    const missing = songs.filter(song => !exist.includes(song.id))

    if (missing.length == 0) {
        return
    }

    console.log("Downloading", missing.length, "songs")

    async function download(song: Song) {
        const response = await fetch(NetworkAudioUrl(song.id), {
            priority: "low"
        })

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
async function RemoveSongs(ids: id[]) {
    await db.WaitForOpen()

    await db.Delete(...ids)

    for (const id of ids) {
        downloadedSongs.delete(id)
    }
}

export async function Sync(songs: Song[]) {
    await db.WaitForOpen()
    console.log("Syncing", songs.length, "songs")
    const ids = songs.map(song => song.id)

    const existing = await db.GetAllIds()
    console.log("Existing", existing.length)
    await Download(songs)

    const toRemove = existing.filter(id => !ids.includes(id))
    console.log("Removing", toRemove.length)
    if (toRemove.length > 0) {
        await RemoveSongs(toRemove)
    }
}