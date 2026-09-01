import { GetCoverUrl } from "@ts/api/song"
import Settings from "@ts/settings.svelte"

interface Artist {
    name: string,
    nameOriginal?: string
}

type SongType = "original" | "collab" | "cover" | "mashup"
type SongDict = {
    id: id,
    title: string,
    titleOriginal?: string,

    artists: Artist[],
    singers: Artist[],
    artworks: Record<string, string>,

    dateReleased: string

    type: SongType

    seconds: number

    playable: boolean
    audioType: string
    audioId: string
    drmProtected: boolean
}


export class Song {
    public get displayTitle() {
        if (Settings.useOriginalLanguage) {
            return this.titleOriginal ?? this.title
        }
        return this.title
    }
    public get displayArtists() {
        return this.artists.map(a => a.name).join(", ")
    }
    public get displaySingers() {
        return this.singers.map(a => a.name).join(", ")
    }
    public get displayCredits() {
        switch (this.type) {
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
        return {
            playable: this.playable,
            type: this.audioType,
            id: this.audioId,
            drmProtected: this.drmProtected
        }
    }

    public constructor(
        public readonly id: id,
        public readonly title: string,
        public readonly titleOriginal: string | undefined,
        public readonly artists: Artist[],
        public readonly singers: Artist[],
        public readonly artworks: Record<string, string>,
        public readonly dateReleased: Date,
        public readonly type: SongType,
        public readonly seconds: number,
        private readonly playable: boolean,
        private readonly audioType: string,
        private readonly audioId: string,
        private readonly drmProtected: boolean,
        private readonly artworkOverride?: string
    ) { }
    public static FromDict(dict: SongDict) {
        return new Song(
            dict.id,
            dict.title,
            dict.titleOriginal,
            dict.artists,
            dict.singers,
            dict.artworks,
            new Date(dict.dateReleased),
            dict.type,
            dict.seconds,
            dict.playable,
            dict.audioType,
            dict.audioId,
            dict.drmProtected
        )
    }
    public GetArtwork(size: "small" | "medium" | "large" = "medium") {
        if (this.artworkOverride) {
            return this.artworkOverride
        }

        //temp
        const artworks = Object.fromEntries(Object.entries(this.artworks).map(([key, value]) => [key, `${key}/${value}`]))
        const art = (
            artworks["custom"]
            || artworks["default"]
            || artworks["disc"]
            || artworks["plush"]
        )

        if (!art) {
            return
        }

        return GetCoverUrl(art, size)
    }
}
