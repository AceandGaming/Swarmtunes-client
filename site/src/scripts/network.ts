type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json }
type id = string

class Network {
    static get serverURL() {
        //@@release-only@@ return "https://api.swarmtunes.com"
        return "https://dev-api.swarmtunes.com"
    }
    static get swarmFMURL() {
        return "https://swarmfm.boopdev.com/v2"
    }
    static get userToken() {
        return sessionStorage.getItem("userToken")
    }
    static IsLoggedIn() {
        return this.userToken !== null
    }
    static IsAdmin() {
        return sessionStorage.getItem("isAdmin") == "true"
    }
    static IsOnline() {
        return this.isOnline
    }

    private static isOnline = true

    static async CheckOnline() {
        try {
            const response = await fetch(`${this.serverURL}/`)
            this.isOnline = response.ok
        }
        catch {
            this.isOnline = false
        }
    }
    static async GetNewSession() {
        const response = await this.SafeFetch("me/session", "GET")
        if (!response.ok) {
            return
        }
        const json = await response.json()
        let activateCallbacks = false
        if (!this.IsLoggedIn()) {
            activateCallbacks = true
        }
        sessionStorage.setItem("userToken", json["token"])
        sessionStorage.setItem("isAdmin", json["isAdmin"])
        if (activateCallbacks) {
            Login.CallLoginCallbacks()
        }
    }
    static async SafeFetch(url: string, method: "GET" | "POST" | "DELETE" | "PUT" | "PATCH", body?: Json): Promise<Response> {
        const response = await fetch(`${this.serverURL}/${url}`, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.userToken}`,
            },
            //@@release-only@@ credentials: "include",
            body: JSON.stringify(body),
        })
        if (!response.ok && response.status == 401) {
            //@@release-only@@if (response.headers.get("token-expired") == "true") {
            //@@release-only@@    sessionStorage.removeItem("userToken")
            //@@release-only@@    sessionStorage.removeItem("isAdmin")
            //@@release-only@@}
            if (response.headers.get("session-expired") == "true") {
                sessionStorage.removeItem("userToken")
                sessionStorage.removeItem("isAdmin")
                await this.GetNewSession()
                if (!this.IsLoggedIn()) {
                    window.location.reload()
                }
                else {
                    return await this.SafeFetch(url, method, body)
                }
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

    static async GetSwarmFMStream() {
        const response = await this.Get(`swarmfm`)
        const json = await response.json()
        return `${json[0]}?now=${Date.now()}`
    }
    static async GetSwarmFMInfo() {
        const response = await fetch(`${this.swarmFMURL}/player`)
        if (!response.ok) {
            console.error("Failed to get swarmfm info")
            return
        }
        const json = await response.json()
        const current = json["current"]
        const next = json["next"]

        function ConvertSingers(singers: string[]) {
            const result: string[] = []
            for (const singer of singers) {
                switch (singer) {
                    case "neuro":
                        result.push("Neuro-sama")
                        break
                    case "evil":
                        result.push("Evil Neuro")
                        break
                    default:
                        result.push(singer.charAt(0).toUpperCase() + singer.slice(1))
                        break
                }
            }
            return result
        }
        function GetCoverType(singers: string[]) {
            if (singers.includes("neuro")) {
                return "neuro"
            }
            if (singers.includes("evil")) {
                return "evil"
            }
            return "duet"
        }

        let coverType: "neuro" | "evil" | "duet" | "custom" = GetCoverType(current["singer"])
        if (current["album_cover"] != null) {
            coverType = "custom"
        }
        const currentSong = new Song({
            id: "swarmfm_" + current["id"],
            title: current["name"],
            artist: current["artist"],
            singers: ConvertSingers(current["singer"]),
            coverType: coverType,
            coverArt: current["album_cover"],
        })

        const nextSong = new Song({
            id: "swarmfm_" + next["id"],
            title: next["name"],
            artist: next["artist"],
            singers: ConvertSingers(next["singer"]),
            coverType: GetCoverType(next["singer"]),
        })

        const position = json["position"]
        const duration = current["duration"]

        return new SwarmFMInfo(currentSong, nextSong, position, duration)
    }
    static async GetSong(id: id | id[]) {
        const params = new URLSearchParams()
        let ids = EnsureArray(id)
        for (let i = 0; i < ids.length; i++) {
            params.append("ids", ids[i])
        }
        const response = await this.Get(`songs?${params.toString()}`)
        const songs = []
        for (const dict of await response.json()) {
            songs.push(new Song(dict))
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
    static GetCover(name: string, size: number = 128) {
        if (!name) {
            //console.error("Invalid cover name", name)
            return "src/assets/no-song.png"
        }
        return `${this.serverURL}/covers/${name}?size=${size}`
    }
    static GetAudioURL(song: Song) {
        return `${this.serverURL}/files/${song.Id}`
    }
    static async GetAllSongs({ filters = [], maxResults = 100 } = {}) {
        const params = new URLSearchParams()
        params.append("filters", filters.join(","))
        params.append("maxResults", String(maxResults))
        const response = await this.Get(`songs?${params.toString()}`)
        const songs = []
        for (const dict of await response.json()) {
            songs.push(new Song(dict))
        }
        return songs
    }
    static async Search(query: string) {
        const params = new URLSearchParams()
        params.append("query", query)
        const response = await this.QuickGet(`search?${params.toString()}`)
        const songs = []
        for (const dict of await response.json()) {
            songs.push(new Song(dict))
        }
        return songs
    }

    static async GetAlbum(id: id | id[], getSongs: boolean = false) {
        const params = new URLSearchParams()
        const ids = EnsureArray(id)
        for (let i = 0; i < ids.length; i++) {
            params.append("ids", ids[i])
        }
        const response = await this.Get(`albums?${params.toString()}`)
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
        const response = await this.Get(`albums?${params.toString()}`)
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

    static async Login(username: string, password: string, remeber: boolean = false) {
        if (DEV_MODE) {
            remeber = false
        }
        const response = await this.Post(`users/login`, {
            username: username,
            password: password,
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
    static async Register(username: string, password: string, remeber: boolean = false) {
        if (DEV_MODE) {
            remeber = false
        }
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
        const response = await this.Get(`playlists?${params.toString()}`)
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
        const response = await this.Get(`playlists`)
        const playlists = []
        for (const dict of await response.json()) {
            playlists.push(new Playlist(dict))
        }
        return playlists
    }
    static async CreatePlaylist(name: string) {
        const response = await this.Post(`playlists`, { name: name })
        const json = await response.json()
        if (!response.ok) {
            return { error: json["detail"] }
        }
        return new Playlist(json)
    }
    static async DeletePlaylist(playlist: id) {
        await this.Delete(`playlists/${playlist}`)
    }
    static async AddSongToPlaylist(playlist: id, songs: id[]) {
        await this.Patch(`playlists/${playlist}/add`, {
            songs: EnsureArray(songs),
        })
    }
    static async RemoveSongFromPlaylist(playlist: id, songs: id[]) {
        await this.Patch(`playlists/${playlist}/remove`, {
            songs: EnsureArray(songs),
        })
    }
    static async RenamePlaylist(playlist: id, name: string) {
        await this.Patch(`playlists/${playlist}`, { name: name })
    }

    static async ServerResync() {
        RequireAdmin()
        await this.Post("resync", {})
    }
}
