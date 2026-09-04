import { Sync } from "@ts/song-downloads.svelte"
import { GetDownloadedPlaylistIds, DownloadPlaylist as Download, RemovePlaylist as Remove, PlaylistDownloaded as Exists } from "@ts/playlist-downloads.ts"
import SongProvider from "@ts/song-provider"
import { GetItemsOfPlaylist } from "@ts/api/playlist"

let syncPromise: Promise<void> | undefined = $state()
const downloading = $derived(syncPromise !== undefined)

async function Update() {
    if (syncPromise) {
        await syncPromise
    }

    syncPromise = (async () => {
        const ids = await GetDownloadedPlaylistIds()

        const items = (
            await Promise.all(ids.map(id => GetItemsOfPlaylist(id)))
        ).flat()
        const songs = await SongProvider.GetMany(items.map(item => item.songId))

        await Sync(songs)
    })()

    try {
        await syncPromise
    }
    finally {
        syncPromise = undefined
    }
}

export function Downloading() {
    return downloading
}

export async function AddPlaylist(id: id) {
    await Download(id)
    await Update()
}
export async function RemovePlaylist(id: id) {
    await Remove(id)
    await Update()
}
export async function PlaylistDownloaded(id: id) {
    return await Exists(id)
}