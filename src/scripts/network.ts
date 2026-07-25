import { EnsureArray, sleep, EnsureValue, RequireAdmin } from "@ts/misc"
import { Album } from "@ts/types/album"
import { Playlist } from "@ts/types/playlist"
import { Song } from "@ts/types/song"
import { Login } from "@ts/ui/popups/login"
import ToastManager from "@ts/ui/toast-manager"

const SERVER_URL = import.meta.env.VITE_API_URL

export default class Network {
    static get serverURL() {
        return `${SERVER_URL}/v1`
    }
    static IsLoggedIn() {
        return this.username !== undefined
    }
    static IsAdmin() {
        return this.isAdmin
    }
    static IsOnline() {
        return this.isOnline
    }

    private static isOnline = true
    private static isAdmin = false
    private static username: string | undefined

    static async CheckOnline() {
        try {
            const response = await fetch(`${this.serverURL}/`)
            await response.json()
            this.isOnline = response.ok
        }
        catch {
            this.isOnline = false
        }
        return this.isOnline
    }
    static async GetSession() {
        if (!this.IsOnline()) {
            this.username = localStorage.getItem("username") || undefined
            return
        }
        const response = await fetch(`${this.serverURL}/me/session`, {
            method: "GET",
            credentials: "include"
        })
        if (!response.ok) {
            return
        }
        const json = await response.json()
        this.username = json["username"]
        this.isAdmin = json["isAdmin"]


        try {
            localStorage.setItem("username", this.username || "")
        }
        catch (e) {
            console.error("Failed to save username", e)
        }

        Login.CallLoginCallbacks()

    }
    static async SafeFetch(url: string, method: "GET" | "POST" | "DELETE" | "PUT" | "PATCH", body?: Json): Promise<Response> {
        const response = await fetch(`${this.serverURL}/${url}`, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(body),
        })
        if (!response.ok && response.status == 401) {
            if (response.headers.get("invaild-token") == "true") {
                //window.location.reload()
                throw new Error("Invalid token")
            }
        }
        return response
    }
    static async Get(url: string) {
        return await this.SafeFetch(url, "GET")
    }
    static async QuickGet(url: string) {
        return await fetch(`${this.serverURL}/${url}`)
    }
    static async Post(url: string, data: Json) {
        return await this.SafeFetch(url, "POST", data)
    }
    static async Delete(url: string) {
        return await this.SafeFetch(url, "DELETE")
    }
    static async Put(url: string, data: Json) {
        return await this.SafeFetch(url, "PUT", data)
    }
    static async Patch(url: string, data: Json) {
        return await this.SafeFetch(url, "PATCH", data)
    }

    static async GetSong(id: id | id[]) {
        let ids = EnsureArray(id).slice()
        const songs = []
        while (ids.length > 0) {
            const params = new URLSearchParams()
            const batch = ids.splice(0, 100)
            for (const id of batch) {
                params.append("ids", id)
            }
            const response = await this.Get(`songs/?${params.toString()}`)
            if (!response.ok) {
                console.error("Failed to get song")
                return
            }
            for (const dict of await response.json()) {
                songs.push(new Song(dict))
            }
            if (ids.length > 0) {
                await sleep(100)
            }
        }

        return Array.isArray(id) ? songs : songs[0]
    }
    static async ShareSong(id: id) {
        const response = await this.Get(`songs/${id}/share`)
        const json = await response.json()
        return json["link"]
    }
    /** @deprecated */
    static async GetMP3(id: id, isTagged: boolean = false) {
        return await this.DownloadSong(id, isTagged)
    }
    static async DownloadSong(id: id, isTagged: boolean = false) {
        const a = document.createElement("a")
        a.href = `${this.serverURL}/files/${id}?export=${isTagged}`
        a.click()
        a.remove()
    }
    static async GetSongAudio(id: id) {
        const response = await this.Get(`files/${id}`)
        const blob = await response.blob()
        return blob
    }
    static GetCover(name?: string, size: number = 512) {
        if (!name) {
            console.warn("Invalid cover name", name)
            return "src/assets/no-song.png"
        }
        return `${this.serverURL}/covers/${encodeURIComponent(name)}?size=${size}`
    }
    static GetAudioURL(id: id) {
        return `${this.serverURL}/files/${id}`
    }
    static async GetAllSongs({ filters = [], maxResults = 100 }: { filters?: string[]; maxResults?: number } = {}) {
        const params = new URLSearchParams()
        params.append("filters", filters.join(","))
        params.append("maxResults", String(maxResults))
        const response = await this.Get(`songs/?${params.toString()}`)
        const songs = []
        for (const dict of await response.json()) {
            songs.push(new Song(dict))
        }
        return songs
    }
    static async Search(query: string, maxResults: number = 10) {
        const params = new URLSearchParams()
        params.append("query", query)
        params.append("maxResults", String(maxResults))
        const response = await this.QuickGet(`search?${params.toString()}`)
        const songs = []
        for (const dict of await response.json()) {
            songs.push(new Song(dict))
        }
        return songs
    }
    static async UpdateSong(id: id, data: Json) {
        const response = await this.Patch(`songs/${id}`, data)
        return await response.json()
    }

    static async GetAlbum(id: id | id[], getSongs: boolean = false) {
        const params = new URLSearchParams()
        const ids = EnsureArray(id)
        for (let i = 0; i < ids.length; i++) {
            params.append("ids", ids[i])
        }
        const response = await this.Get(`albums/?${params.toString()}`)
        const albums = []
        for (const dict of await response.json()) {
            albums.push(new Album(dict))
        }
        if (getSongs) {
            for (const album of albums) {
                await album.GetSongs()
            }
        }
        return EnsureValue(albums)
    }
    static async GetAllAlbums(...filters: string[]) {
        const params = new URLSearchParams()
        params.append("filters", filters.join(","))
        const response = await this.Get(`albums/?${params.toString()}`)
        const albums = []
        for (const dict of await response.json()) {
            albums.push(new Album(dict))
        }
        return albums
    }
    static async GetAlbumMP3s(id: id) {
        const a = document.createElement("a")
        a.href = `${this.serverURL}/files/album/${id}`
        a.click()
        a.remove()
    }

    // static async GetEmote(nameOrNames) {
    //     const params = new URLSearchParams()
    //     const names = EnsureArray(nameOrNames)
    //     for (let i = 0 i < names.length i++) {
    //         params.append("names", names[i])
    //     }
    //     const response = await this.Get(`emotes/?${params.toString()}`)
    //     return EnsureValue(response.json()) //just a list of urls. no class
    // }
    static async SharePlaylist(id: id) {
        const response = await this.Get(`playlists/${id}/share/`)
        const json = await response.json()
        return json["link"]
    }
    static async AddSharedPlaylist(code: string) {
        const response = await this.Post(`playlists/shared/`, { code: code })
        const json = await response.json()
        const playlist = new Playlist(json["playlist"])
        return playlist
    }

    static async Login(username: string, password: string, remeber: boolean = false) {
        const response = await this.Post(`users/login`, {
            username: username,
            password: password,
            remeber: remeber
        })
        const json = await response.json()
        if (json["success"]) {
            this.username = username
            this.isAdmin = json["isAdmin"]

            try {
                localStorage.setItem("username", this.username || "")
            }
            catch (e) {
                console.error("Failed to save username", e)
            }
        } else {
            return json["detail"]
        }
    }
    static async Register(username: string, password: string, remeber: boolean = false) {
        const response = await this.Post(`users/login`, {
            username: username,
            password: password,
            create: true,
            remeber: remeber
        })
        const json = await response.json()
        if (json["token"]) {
            sessionStorage.setItem("userToken", json["token"])
            sessionStorage.setItem("isAdmin", json["isAdmin"])
        } else {
            return json["detail"]
        }
    }
    static async LogOut() {
        await this.Post(`me/logout`, {})
        sessionStorage.removeItem("userToken")
        sessionStorage.removeItem("isAdmin")
        window.location.reload()
    }

    static async GetPlaylist(idOrIds: id | id[], getSongs: boolean = false) {
        const params = new URLSearchParams()
        const ids = EnsureArray(idOrIds)
        for (let i = 0; i < ids.length; i++) {
            params.append("ids", ids[i])
        }
        const response = await this.Get(`playlists/?${params.toString()}`)
        const playlists = []
        for (const dict of await response.json()) {
            playlists.push(new Playlist(dict))
        }
        if (getSongs) {
            for (const playlist of playlists) {
                await playlist.GetSongs()
            }
        }
        return EnsureValue(playlists)
    }
    static async GetAllPlaylists() {
        const response = await this.Get(`playlists/`)
        const playlists = []
        for (const dict of await response.json()) {
            playlists.push(new Playlist(dict))
        }
        return playlists
    }
    static async GetPlaylistMP3s(id: id) {
        const response = await fetch(
            `${this.serverURL}/files/playlist/${id}`,
            { method: "GET", credentials: "include" }
        )

        if (!response.ok) throw new Error("Download failed")

        const blob = await response.blob()
        const url = URL.createObjectURL(blob)

        const a = document.createElement("a")
        a.href = url
        a.download = "playlist.zip"
        a.click()

        URL.revokeObjectURL(url)
    }
    static async CreatePlaylist(name: string) {
        const response = await this.Post(`playlists/`, { name: name })
        const json = await response.json()
        if (!response.ok) {
            return { error: json["detail"] }
        }
        return new Playlist(json)
    }
    static async DeletePlaylist(playlist: id) {
        await this.Delete(`playlists/${playlist}/`)
    }
    static async AddSongToPlaylist(playlist: id, songs: id[]) {
        await this.Patch(`playlists/${playlist}/add/`, {
            songs: EnsureArray(songs),
        })
    }
    static async RemoveSongFromPlaylist(playlist: id, songs: id[]) {
        await this.Patch(`playlists/${playlist}/remove/`, {
            songs: EnsureArray(songs),
        })
    }
    static async RenamePlaylist(playlist: id, name: string) {
        await this.Patch(`playlists/${playlist}/`, { name: name })
    }
    static async UpdatePlaylist(playlist: Playlist) {
        await this.Patch(`playlists/${playlist.Id}/`, {
            name: playlist.Title,
            songIds: playlist.SongIds
        })
    }

    static GetEmoteUrl(name: string) {
        return `${this.serverURL}/emotes/${name}/`
    }
}

window.Network = Network