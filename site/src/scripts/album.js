class Album {
    get uuid() {
        return this.#uuid
    }
    get jsDate() {
        if (this.date === "unknown") {
            return new Date(0)
        }
        const [day, month, year] = this.date.split('/').map(Number);
        if (!day || !month || !year) {
            console.error("Invalid date", this.date)
            return new Date()
        }
        return new Date(year + 2000, month - 1, day)
    }
    get prettyDate() {
        return this.jsDate.toLocaleDateString("en-AU", {
            day: "numeric",
            month: "short",
            year: "numeric"
        })
    }
    get songs() {
        if (this.#songs.length === 0) {
            console.warn("Album has no songs")
        }
        return this.#songs
    }
    get songsLoaded() {
        return this.#songsLoaded
    }
    get prettyType() {
        return { "neuro": "Neuro-sama", "evil": "Evil Neuro", "duet": "Neuro sama and Evil Neuro" }[this.type]
    }
    get title() {
        return this.prettyType + " Karaoke"
    }
    #uuid
    #songs
    #songsLoaded

    static CreateAlbumFromJson(json, songsAreUuids = false) {
        if (!HasValues(json, "uuid", "date", "type", "songs")) {
            console.error("Invalid album json", json)
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
        return new Album(json["uuid"], json["date"], json["type"], songs)
    }
    constructor(uuid, date, type, songs, songsLoaded = false) {
        this.#uuid = uuid
        this.date = date
        this.type = type
        this.#songs = songs
        this.#songsLoaded = songsLoaded
    }
    async LoadSongs() {
        if (this.#songsLoaded) {
            return
        }
        const uuids = []
        for (const song of this.#songs) {
            uuids.push(song.uuid)
        }
        this.#songs = await Network.GetSong(uuids)
        this.#songsLoaded = true
    }
}

function OnAlbumClick(event) {
    const uuid = event.target.dataset.uuid
    Network.GetAlbum(uuid).then(album => {
        PlaylistView.Load(album.songs, album.title, album.type, album.prettyDate)
        PlaylistView.Show()
    })
}