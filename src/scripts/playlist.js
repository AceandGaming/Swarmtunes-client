class Playlist {
    get uuid() {
        return this.#uuid
    }
    get songs() {
        return this.#songs
    }
    get songsLoaded() {
        return this.#songsLoaded
    }
    get type() {
        if (this.#type === undefined) {
            this.GetTypeFromSongs()
        }
        return this.#type
    }
    get cover() {
        if (this.#songs.length === 1) {
            return this.#songs[0].uuid
        }
        return this.type
    }

    #uuid
    #songs
    #songsLoaded
    #type

    static CreatePlaylistFromJson(json, songsAreUuids = false) {
        if (!HasValues(json, "uuid", "title", "songs")) {
            console.error("Invalid playlist json", json)
            return
        }
        const songs = []
        for (const song of json["songs"]) {
            if (songsAreUuids) {
                songs.push(new SongPlaceholder(song))
            }
            else {
                songs.push(Song.CreateSongFromJson(song))
            }
        }
        return new Playlist(json["uuid"], json["title"], songs)
    }
    constructor(uuid, name, songs, songsLoaded = false) {
        this.#uuid = uuid
        this.name = name
        this.#songs = songs
        this.#songsLoaded = songsLoaded
    }
    AddSong(song) {
        if (this.#songs.find(s => s.uuid === song.uuid)) {
            return
        }
        this.#songs.push(song)
        this.GetTypeFromSongs()
        Network.AddSongToPlaylist(this.uuid, song.uuid)
    }
    RemoveSong(song) {
        this.#songs = this.#songs.filter(s => s.uuid !== song.uuid)
        this.GetTypeFromSongs()
        Network.RemoveSongFromPlaylist(this.uuid, song.uuid)
    }
    GetTypeFromSongs() {
        if (!this.#songsLoaded) {
            //console.error("Songs not loaded")
            return "unknown"
        }
        if (this.songs.length === 0) {
            return "unknown"
        }
        const counts = {
            "neuro": 0,
            "evil": 0,
            "duet": 0
        }
        for (const song of this.#songs) {
            counts[song.type]++
        }
        const mix = (counts["evil"] + counts["duet"] * 0.5) / (counts["neuro"] + counts["evil"] + counts["duet"])
        if (mix < 0.33) {
            this.#type = "neuro"
        }
        else if (mix > 0.66) {
            this.#type = "evil"
        }
        else {
            this.#type = "duet"
        }
        PlaylistTab.Populate()
    }
    async LoadSongs() {
        if (this.#songsLoaded) {
            return
        }
        if (this.#songs.length === 0) {
            this.#songsLoaded = true
            return
        }
        const uuids = []
        for (const song of this.#songs) {
            uuids.push(song.uuid)
        }
        this.#songs = EnsureArray(await Network.GetSong(uuids))
        this.#songsLoaded = true
    }
}
class PlaylistManager {
    static get playlists() {
        return Object.values(this.#playlists)
    }

    static #playlists = {}
    static error = false

    static async GetPlaylists() {
        try {
            const playlists = await Network.GetAllPlaylists()
            for (const playlist of playlists) {
                this.#playlists[playlist.uuid] = playlist
            }
        }
        catch (error) {
            console.error(error)
            this.error = true
        }
    }
    static GetPlaylist(uuid) {
        const playlist = this.#playlists[uuid]
        if (!playlist.songsLoaded) {
            console.warn("Playlist not loaded")
        }
        return playlist
    }
    static async LoadPlaylist(uuid) {
        const playlist = this.#playlists[uuid]
        await playlist.LoadSongs()
        PlaylistTab.OnPlaylistLoaded()
    }
    static AddPlaylist(playlist) {
        this.#playlists[playlist.uuid] = playlist
    }
    static RemovePlaylist(uuid) {
        delete this.#playlists[uuid]
        Network.DeletePlaylist(uuid)
        PlaylistTab.Populate()
    }
    static async DisplayPlaylist(uuid) {
        const playlist = this.#playlists[uuid]
        if (!playlist.songsLoaded) {
            await this.LoadPlaylist(uuid)
        }
        PlaylistView.Load(playlist.songs, playlist.name, playlist.type, "", "playlist-item", playlist.uuid)
        PlaylistView.Show()
    }
}

function OnPlaylistClick(event) {
    const uuid = event.target.dataset.uuid
    PlaylistManager.DisplayPlaylist(uuid)
}