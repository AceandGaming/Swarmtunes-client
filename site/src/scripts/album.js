class Album {
    get uuid() {
        return this.#uuid
    }
    get jsDate() {
        if (this.date === "unknown") {
            return new Date(0)
        }
        return new Date(this.date)
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
    get cover() {
        if (this.#songs.length === 1) {
            return this.#songs[0].uuid
        }
        return this.type
    }

    #uuid
    #songs
    #songsLoaded

    static CreateAlbumFromJson(json) {
        if (!HasValues(json, "id", "date", "type", "songIds")) {
            console.error("Invalid album json", json)
            return
        }
        const songs = []
        for (const id of json["songIds"]) {
            songs.push(new SongPlaceholder(id))
        }
        return new Album(json["id"], json["date"], json["type"], songs)
    }
    constructor(uuid, date, type, songs) {
        this.#uuid = uuid
        this.date = date
        this.type = type
        this.#songs = songs
        this.#songsLoaded = false
    }
    async LoadSongs() {
        if (this.#songsLoaded) {
            return
        }
        const uuids = []
        for (const song of this.#songs) {
            uuids.push(song.uuid)
        }
        this.#songs = EnsureArray(await Network.GetSong(uuids))
        this.#songsLoaded = true
        return this.#songs
    }
}

function OnAlbumClick(event) {
    const uuid = event.target.dataset.uuid
    MediaView.ShowLoading()
    Network.GetAlbum(uuid).then(album => {
        title = album.title
        if (album.songs.length === 1) {
            title = "Special Release"
        }
        AlbumView.Show(album)
    })
}