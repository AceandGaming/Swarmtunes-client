import { Database } from "@ts/indexd-db.svelte"
type Item = {
    id: string,
}


const db = new Database<Item>("playlist", true)
db.Open()

export async function GetDownloadedPlaylistIds() {
    await db.WaitForOpen()
    return await db.GetAllIds()
}

export async function DownloadPlaylist(id: string) {
    await db.WaitForOpen()
    await db.Put({ id })
}
export async function RemovePlaylist(id: string) {
    await db.WaitForOpen()
    await db.Delete(id)
}
export async function PlaylistDownloaded(id: string) {
    await db.WaitForOpen()
    return await db.Has(id)
}