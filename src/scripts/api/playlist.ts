import { Playlist } from "@ts/models/playlist"
import { Get, Post, Patch, Delete } from "./network"

export async function GetPlaylist(id: id): Promise<Playlist> {
    const json = await Get(`/playlists/${id}`)
    return Playlist.FromDict(json)
}
export async function GetPlaylists(ids?: id[]): Promise<Playlist[]> {
    if (!ids) {
        const json = await Get(`/playlists/`)
        return json.map(Playlist.FromDict)
    }

    const params = new URLSearchParams()

    for (const id of ids) {
        params.append("id", id)
    }

    const json = await Get(`/playlists?${params.toString()}`)
    return json.map(Playlist.FromDict)
}

export async function GetItemsOfPlaylist(id: id): Promise<{ songId: id, dateAdded: string }[]> {
    const json = await Get(`/playlists/${id}/songs`)
    return json
}

export async function AddSongsToPlaylist(playlistId: id, songIds: id[]) {
    await Post(`/playlists/${playlistId}/songs`, { songIds })
}
export async function RemoveSongsFromPlaylist(playlistId: id, songIds: id[]) {
    await Post(`/playlists/${playlistId}/songs/remove`, { songIds })
}

export async function CreatePlaylist(title: string, songIds?: id[]): Promise<Playlist> {
    const json = await Post("/playlists/", { title, songIds })
    return Playlist.FromDict(json)
}
export async function RenamePlaylist(id: id, title: string) {
    const json = await Patch(`/playlists/${id}`, { title })
    return Playlist.FromDict(json)
}
export async function DeletePlaylist(id: id) {
    await Delete(`/playlists/${id}`)
}