import { Database } from "@ts/indexd-db"

type Item = {
    id: string,
}


const db = new Database<Item>("playlist")

db.Open()

export async function GetDownloadedPlaylistIds() {
    return await db.GetAllIds()
}

export async function DownloadPlaylist(id: string) {
    await db.Put({ id })
}
export async function RemovePlaylist(id: string) {
    await db.Delete(id)
}
export async function PlaylistDownloaded(id: string) {
    return await db.Has(id)
}