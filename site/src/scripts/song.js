class SongPlaceholder {
    get uuid() {
        return this.#uuid;
    }
    get coverArtist() {
        throw new Error("Song placeholder has no cover artist");
    }
    get jsDate() {
        throw new Error("Song placeholder has no date");
    }
    get title() {
        throw new Error("Song placeholder has no title");
    }
    get artist() {
        throw new Error("Song placeholder has no artist");
    }

    #uuid;

    constructor(uuid) {
        this.#uuid = uuid;
    }

    CoverUrl(size = 128) {
        return Network.GetCoverUrl(this.uuid, size);
    }
    ToString() {
        return `Song placeholder (${this.uuid})`;
    }
    async GetLoaded() {
        return await Network.GetSong(this.uuid);
    }
    Copy() {
        return new SongPlaceholder(this.uuid);
    }
}
class Song {
    get uuid() {
        return this.#uuid;
    }
    get coverArtist() {
        return ({ neuro: "Neuro-sama", evil: "Evil Neuro", duet: "Neuro-sama, Evil Neuro", mashup: "Neuro-sama, Evil Neuro" }[this.type] ?? this.type);
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
            year: "numeric",
        });
    }

    #uuid;

    constructor(uuid, title, artist, singers, date, type, isOriginal = false, hasCustomCover = false) {
        this.#uuid = uuid;
        this.title = title;
        this.artist = artist;
        this.singers = singers;
        this.date = date;
        this.type = type;
        this.isOriginal = isOriginal;
        this.hasCustomCover = hasCustomCover;
        if (title == "mashup") {
            this.title = this.jsDate.getFullYear() + " Mashup";
        }
    }
    static CreateSongFromJson(json) {
        if (!HasValues(json, "id", "title", "artist", "date", "coverType", "singers", "original")) {
            console.error("Invalid song json", json);
            return;
        }
        return new Song(
            json["id"],
            json["title"],
            json["artist"],
            json["singers"],
            json["date"],
            json["coverType"],
            json["original"],
            json["coverType"] == "custom"
        );
    }

    ToString() {
        return `${this.title} by ${this.artist}`;
    }
    Copy() {
        return new Song(
            this.uuid,
            this.title,
            this.artist,
            this.singers,
            this.date,
            this.type,
            this.isOriginal,
            this.hasCustomCover
        );
    }
    CoverUrl(size = 128) {
        if (this.hasCustomCover) {
            return Network.GetCoverUrl(this.uuid, size);
        }
        return Network.GetCoverUrl(this.type, size);
    }
}

function OnSongClick(event) {
    const uuid = event.target.dataset.uuid;
    Network.GetSong(uuid).then((song) => {
        Audio.Play(song);
        SongQueue.LoadSingleSong(song);
    });
}
function CloneSongs(songs) {
    newSongs = [];
    for (const song of songs) {
        newSongs.push(song.Copy());
    }
    return newSongs;
}
