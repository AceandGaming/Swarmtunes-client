class SongPlaceholder {
    get uuid() {
        return this.#uuid
    }
    get coverArtist() {
        throw new Error("Song placeholder has no cover artist")
    }
    get jsDate() {
        throw new Error("Song placeholder has no date")
    }
    get title() {
        throw new Error("Song placeholder has no title")
    }
    get artist() {
        throw new Error("Song placeholder has no artist")
    }

    #uuid

    constructor(uuid) {
        this.#uuid = uuid
    }

    ToString() {
        return `Song placeholder (${this.uuid})`
    }
    async GetLoaded() {
        return await Network.GetSong(this.uuid)
    }
    Copy() {
        return new SongPlaceholder(this.uuid)
    }
}
class Song {
    get uuid() {
        return this.#uuid
    }
    get coverArtist() {
        return {"neuro": "Neuro-sama", "evil": "Evil Neuro", "duet": "Neuro-sama, Evil Neuro", "mashup": "Neuro-sama, Evil Neuro"}[this.type] ?? this.type
    }
    get jsDate() {
        const [day, month, year] = this.date.split('/').map(Number);
        return new Date(year + 2000, month - 1, day)
    }
    get prettyDate() {
        return this.jsDate.toLocaleDateString("en-AU", {
            day: "numeric",
            month: "short",
            year: "numeric"
        })
    }

    #uuid

    constructor(uuid, title, artist, date, type, isOriginal = false) {
        this.#uuid = uuid
        this.title = title
        this.artist = artist
        this.date = date
        this.type = type
        this.isOriginal = isOriginal
    }
    static CreateSongFromJson(json) {
        if (!HasValues(json, "uuid", "title", "artist", "date", "type", "original")) {
            console.error("Invalid song json", json)
            return
        }
        return new Song(json["uuid"], json["title"], json["artist"], json["date"], json["type"], json["original"])
    }

    ToString() {
        return `${this.title} by ${this.artist}`
    }
    Copy() {
        return new Song(this.uuid, this.title, this.artist, this.date, this.type, this.isOriginal)
    }
}

function OnSongClick(event) {
    const uuid = event.target.dataset.uuid
    Network.GetSong(uuid).then(song => {
        Audio.Play(song)
        SongQueue.LoadSingleSong(song)
    })
}
function CloneSongs(songs) {
    newSongs = []
    for (const song of songs) {
        newSongs.push(song.Copy())
    }
    return newSongs
}