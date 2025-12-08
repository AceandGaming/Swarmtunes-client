interface SongPrams {
    id: id,
    title: string,
    artist: string,
    singers: string[],
    coverType: "neuro" | "evil" | "duet" | "custom",
    date?: string,
    isOriginal?: boolean,
    coverArt?: string|null
}

class Song {
    get Id() { return this.id }
    get Title() { return this.title }
    get Artist() { return this.artist }
    get Singers() { return this.singers }
    get CoverType() { return this.coverType }
    get Date() { return this.date }
    get IsOriginal() { return this.isOriginal }

    get HasCustomCover() {
        return this.coverType == "custom"
    }
    get PrettyDate() {
        return this.date.toLocaleDateString("en-AU", {
            day: "numeric",
            month: "short",
            year: "numeric",
        })
    }
    get Cover(): string {
        if (this.HasCustomCover) {
            if (this.coverArt == null) {
                console.error("Song has custom cover but no cover art", `Type: ${this.coverType}, Art: ${this.coverArt}`)
            }
            // @ts-ignore
            return this.coverArt
        }
        return this.coverType
    }

    private readonly id: id
    private title: string
    private artist: string
    private singers: string[]
    private coverType: "neuro" | "evil" | "duet" | "custom"
    private date: Date
    private isOriginal: boolean
    private readonly coverArt: string|null

    constructor(options: SongPrams) {
        this.id = options.id
        this.title = options.title
        this.artist = options.artist
        this.singers = options.singers
        this.coverType = options.coverType
        this.date = options.date ? new Date(options.date) : new Date()
        this.isOriginal = options.isOriginal ?? false
        this.coverArt = options.coverArt ?? null
        if (options.title === "mashup" && options.date) {
            this.title = `Mashup ${this.date.getFullYear()}`
        }
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
            coverType: this.coverType,
            date: this.date.toISOString(),
            isOriginal: this.isOriginal,
            coverArt: this.coverArt
        }
    }
    Copy() {
        return new Song(this.ToJson())
    }
}

function OnSongClick(event: any) {
    const id = event.target.dataset.id
    Network.GetSong(id).then((song) => {
        if (song === undefined) {
            console.warn("Song clicked with no song")
            return
        }
        // @ts-ignore
        AudioPlayer.instance.Play(song)
        SongQueue.LoadSingleSong(song)
    })
}