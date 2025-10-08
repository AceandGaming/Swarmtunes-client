class SwarmFMInfo {
    constructor(currentSong, nextSong, position, duration) {
        this.currentSong = currentSong
        this.nextSong = nextSong
        this.position = position
        this.duration = duration
    }
}

class Network {
    static get serverURL() {
        return "https://dev-api.swarmtunes.com"
    }
    static get userToken() {
        return sessionStorage.getItem("userToken") //bad but I don't care
    }
    static IsLoggedIn() {
        return this.userToken !== null
    }

    static async Get(url) {
        const response = await fetch(`${this.serverURL}/${url}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.userToken}`
            }
        })
        if (!response.ok && response.status == 401 && response.headers.get("token-expired") == "true") {
            sessionStorage.removeItem("userToken")
            window.location.reload()
        }
        return response
    }

    static async GetSwarmFMStream() {
        const response = await this.Get(`swarmfm`)
        const json = await response.json()
        return `${json[0]}?${Date.now()}`
    }
    static async GetSwarmFMInfo() {
        const response = await fetch("https://swarmfm.boopdev.com/v2/player")
        if (!response.ok) {
            console.error("Failed to get swarmfm info")
            return
        }
        const json = await response.json()
        const current = json["current"]
        const next = json["next"]

        function ConvertCoverartist(artists) {
            if (artists.length == 1) {
                return artists[0]
            }
            else {
                return "duet"
            }
        }
        
        const currentSong = new Song("swarmfm", current["name"], current["artist"], "unknown", ConvertCoverartist(current["singer"]))
        const nextSong = new Song("swarmfm", next["name"], next["artist"], "unknown", ConvertCoverartist(next["singer"]))
        const position = json["position"]
        const duration = current["duration"]

        return new SwarmFMInfo(currentSong, nextSong, position, duration)
    }
    static async GetSong(uuidOrUuids) {
        const params = new URLSearchParams();
        const uuids = EnsureArray(uuidOrUuids)
        for (let i = 0; i < uuids.length; i++) {
            params.append("uuids", uuids[i]);
        }
        const response = await this.Get(`songs?${params.toString()}`)
        const songs = []
        for (const dict of await response.json()) {
            songs.push(Song.CreateSongFromJson(dict))
        }
        return EnsureValue(songs)
    }
    static async GetMP3(uuid, isTagged = false) {
        const a = document.createElement('a');
        a.href = `${this.serverURL}/files/${uuid}?export=${isTagged}`
        a.download = uuid + ".mp3"
        a.click()
        a.remove()
    }
    static async GetCover(name, size = 128) {
        const response = await this.Get(`covers/${name}?size=${size}`)
        return response.text()
    }
    static GetCoverUrl(name, size = 128) {
        if (name == "unknown" || name == null || name == undefined) {
            return "src/art/no_song.png"
        }
        return `${this.serverURL}/covers/${name}?size=${size}`
    }
    static async GetAllSongs({filters = [], maxResults = 100} = {}) {
        const params = new URLSearchParams();
        params.append("filters", filters.join(","));
        params.append("maxResults", maxResults);
        const response = await this.Get(`songs?${params.toString()}`)
        const songs = []
        for (const dict of await response.json()) {
            songs.push(Song.CreateSongFromJson(dict))
        }
        return songs
    }

    static async GetAlbum(uuidOrUuids) {
        const params = new URLSearchParams();
        const uuids = EnsureArray(uuidOrUuids)
        for (let i = 0; i < uuids.length; i++) {
            params.append("uuids", uuids[i]);
        }
        const response = await this.Get(`albums?${params.toString()}`)
        const albums = []
        for (const dict of await response.json()) {
            albums.push(Album.CreateAlbumFromJson(dict))
        }
        return EnsureValue(albums)
    }
    static async GetAllAlbums(...filters) {
        const params = new URLSearchParams();
        params.append("filters", filters.join(","));
        const response = await this.Get(`albums?${params.toString()}`)
        const albums = []
        for (const dict of await response.json()) {
            albums.push(Album.CreateAlbumFromJson(dict, true))
        }
        return albums
    }

    static async GetEmote(nameOrNames) {
        const params = new URLSearchParams();
        const names = EnsureArray(nameOrNames)
        for (let i = 0; i < names.length; i++) {
            params.append("names", names[i]);
        }
        const response = await this.Get(`emotes/?${params.toString()}`)
        return EnsureValue(response.json()) //just a list of urls. no class
    }

    static async Post(url, data) {
        const response = await fetch(`${this.serverURL}/${url}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.userToken}`
            },
            body: JSON.stringify(data)
        })
        if (!response.ok && response.status == 401 && response.headers.get("token-expired") == "true") {
            sessionStorage.removeItem("userToken")
            window.location.reload()
        }
        return response
    }
    static async Login(username, password) {
        const response = await this.Post(`users/login`, {username: username, password: password})
        const json = await response.json()
        if (json["token"]) {
            sessionStorage.setItem("userToken", json["token"])
        }
        else {
            return json["detail"]
        }
    }
    static async Register(username, password) {
        const response = await this.Post(`users/login`, {username: username, password: password, create: true})
        const json = await response.json()
        if (json["token"]) {
            sessionStorage.setItem("userToken", json["token"])
        }
        else {
            return json["detail"]
        }
    }
    static async LogOut() {
        await this.Post(`users/logout`)
        sessionStorage.removeItem("userToken")
        window.location.reload()
    }

    static async GetPlaylist(uuidOrUuids) {
        const params = new URLSearchParams();
        const uuids = EnsureArray(uuidOrUuids)
        for (let i = 0; i < uuids.length; i++) {
            params.append("uuids", uuids[i]);
        }
        const response = await this.Get(`playlists?${params.toString()}`)
        const playlists = []
        for (const dict of await response.json()) {
            playlists.push(Playlist.CreatePlaylistFromJson(dict))
        }
        return EnsureValue(playlists)
    }
    static async GetAllPlaylists() {
        const response = await this.Get(`playlists`)
        const playlists = []
        for (const dict of await response.json()) {
            playlists.push(Playlist.CreatePlaylistFromJson(dict, true))
        }
        return playlists
    }
    static async CreatePlaylist(name) {
        const response = await this.Post(`playlists/new`, {name: name})
        const json = await response.json()
        if (!response.ok) {
            return {error: json["detail"]}
        }
        return Playlist.CreatePlaylistFromJson(json)
    }
    static async DeletePlaylist(playlistUuid) {
        await this.Post(`playlists/delete`, {uuid: playlistUuid})
    }
    static async AddSongToPlaylist(playlistUuid, songUuids) {
        await this.Post(`playlists/${playlistUuid}/add`, {songs: EnsureArray(songUuids)})
    }
    static async RemoveSongFromPlaylist(playlistUuid, songUuids) {
        await this.Post(`playlists/${playlistUuid}/remove`, {songs: EnsureArray(songUuids)})
    }
}