import { Song } from "@ts/models/song"
import { Get, API_URL, Post } from "./network"


export async function GetSong(id: id): Promise<Song> {
    const json = await Get(`/songs/${id}`)
    return Song.FromDict(json)
}

export async function GetSongs(ids: id[]): Promise<Song[]> {
    const json = await Post(`/songs/batch`, { ids })
    return json.map(Song.FromDict)
}
export async function GetAllSongs(ids?: id[], options: { title?: string, type?: string, offset?: number, limit?: number } = {}): Promise<Song[]> {
    const params = new URLSearchParams()

    if (ids) {
        for (const id of ids) {
            params.append("id", id)
        }
    }

    for (const [key, value] of Object.entries(options)) {
        if (value !== undefined) {
            params.set(key, String(value))
        }
    }

    const json = await Get(`/songs/?${params.toString()}`)
    return json.map(Song.FromDict)
}

export async function ExportSong(id: id) {
    const a = document.createElement("a")
    a.href = `${API_URL}/songs/${id}/gdrive`
    a.click()
    a.remove()
}

export async function Search(query: string, limit = 10): Promise<Song[]> {
    const params = new URLSearchParams({
        q: query,
        limit: String(limit)
    })

    const json = await Get(`/search?${params}`)
    if (!json) {
        return []
    }
    return json.map(Song.FromDict)
}

export function GetSongAudioUrl(id: id) {
    return `${API_URL}/songs/${id}/audio`
}

export function GetCoverUrl(path?: string, size: "small" | "medium" | "large" = "medium") {
    if (!path) {
        return "/no-song.png"
    }

    return `${API_URL}/covers/${path}?size=${size}`
}