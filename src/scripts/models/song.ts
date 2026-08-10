import { GetCoverUrl, GetSong } from "@ts/api/song"
import SongCache from "@ts/song-cache"

interface Artist {
    name: string,
    nameOriginal?: string
}

type SongType = "original" | "collab" | "cover" | "mashup"
type SongDetails = {
    type: SongType

    seconds: number

    playable: boolean
    audioType: string
    audioId: string
    drmProtected: boolean
}

type SongLiteDict = {
    id: id,
    title: string,
    titleOriginal?: string,

    artists: Artist[],
    singers: Artist[],
    artworks: Record<string, string>,

    dateReleased: string
}
type SongDetailsDict = {
    type: SongType

    seconds: number

    playable: boolean
    audioType: string
    audioId: string
    drmProtected: boolean
}
type SongFullDict = SongLiteDict & SongDetailsDict


export class Song {
    public get displayTitle() {
        return this.title
    }
    public get displayArtists() {
        return this.artists.map(a => a.name).join(", ")
    }
    public get displaySingers() {
        return this.singers.map(a => a.name).join(", ")
    }
    public get displayCredits() {
        if (!this.details) {
            return `${this.displayArtists} • ${this.displaySingers}`
        }
        switch (this.details.type) {
            case "original":
            case "mashup":
                return this.displayArtists
            case "collab":
                return [...new Set(this.singers.concat(this.artists))]
                    .map(a => a.name)
                    .join(", ")
            case "cover":
                return `${this.displayArtists} • ${this.displaySingers}`
        }
    }

    public get displayDate() {
        return this.dateReleased.toLocaleDateString("en-AU", {
            day: "numeric",
            month: "short",
            year: "numeric",
        })
    }

    public get audioInfo() {
        if (!this.details) {
            return undefined
        }
        return {
            playable: this.details.playable,
            type: this.details.audioType,
            id: this.details.audioId,
            drmProtected: this.details.drmProtected
        }
    }

    public get artwork() {
        //temp
        const artworks = Object.fromEntries(Object.entries(this.artworks).map(([key, value]) => [key, `${key}/${value}`]))
        const art = (
            artworks["custom"]
            || artworks["default"]
            || artworks["disc"]
            || artworks["plush"]
        )

        return GetCoverUrl(art)
    }

    public constructor(
        public readonly id: id,
        public readonly title: string,
        public readonly titleOriginal: string | undefined,
        public readonly artists: Artist[],
        public readonly singers: Artist[],
        public readonly artworks: Record<string, string>,
        public readonly dateReleased: Date,
        private readonly details?: SongDetails
    ) { }
    public static FromDict(dict: SongLiteDict | SongFullDict) {
        if ("type" in dict) {
            return new Song(
                dict.id,
                dict.title,
                dict.titleOriginal,
                dict.artists,
                dict.singers,
                dict.artworks,
                new Date(dict.dateReleased), {
                type: dict.type,
                seconds: dict.seconds,
                playable: dict.playable,
                audioType: dict.audioType,
                audioId: dict.audioId,
                drmProtected: dict.drmProtected
            })
        } else {
            return new Song(
                dict.id,
                dict.title,
                dict.title,
                dict.artists,
                dict.singers,
                dict.artworks,
                new Date(dict.dateReleased)
            )
        }
    }
    public async GetDetailed() {
        if (this.details) {
            return this
        }

        const song = await GetSong(this.id)
        SongCache.Set(this.id, song)

        return song
    }

    public Copy() {
        return new Song(
            this.id,
            this.title,
            this.title,
            this.artists,
            this.singers,
            this.artworks,
            this.dateReleased
        )
    }
}
