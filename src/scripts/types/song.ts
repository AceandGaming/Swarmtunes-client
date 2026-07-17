interface SongPrams {
    id: id,
    title: string,
    artist: string,
    singers: string[],
    date?: string,
    isOriginal?: boolean,
    cover?: string | null,
    youtubeId?: string | null
}

export class Song {
    public static CreateOfflineSong(id: id) {
        return new Song({
            id,
            title: "Unavailable",
            artist: "offline",
            singers: ["Offline"],
        })
    }


    get Id() { return this.id }
    get Title() { return this.title }
    get Artist() { return this.artist }
    get Singers() { return this.singers }
    get Date() { return this.date }
    get IsOriginal() { return this.isOriginal }
    get YoutubeId() { return this.youtubeId }
    get CoverArt() { return this.coverArt }

    get PrettyDate() {
        return this.date.toLocaleDateString("en-AU", {
            day: "numeric",
            month: "short",
            year: "numeric",
        })
    }
    get CoverUrl(): string {
        return this.coverArt ? window.Network.GetCover(this.coverArt) : "src/assets/no-song.png"
    }

    private readonly id: id
    private title: string
    private artist: string
    private singers: string[]
    private date: Date
    private isOriginal: boolean
    private readonly coverArt: string | null
    private youtubeId: string | null

    constructor(options: SongPrams) {
        this.id = options.id
        this.title = options.title
        this.artist = options.artist
        this.singers = options.singers
        this.date = options.date ? new Date(options.date) : new Date()
        this.isOriginal = options.isOriginal ?? false
        this.coverArt = options.cover ?? null
        if (options.title === "mashup" && options.date) {
            this.title = `${this.date.getFullYear()} Mashup`
        }
        this.youtubeId = options.youtubeId ?? null
    }

    ToString() {
        return `${this.title} by ${this.artist}`
    }
    ToJson() {
        return {
            id: this.id,
            title: this.title,
            artist: this.artist,
            singers: this.singers,
            date: this.date.toISOString(),
            isOriginal: this.isOriginal,
            cover: this.coverArt,
            youtubeId: this.youtubeId
        }
    }
    Copy() {
        return new Song(this.ToJson())
    }
}
