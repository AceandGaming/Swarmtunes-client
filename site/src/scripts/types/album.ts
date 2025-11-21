interface AlbumPrams {
    id: id
    date: string
    singers: string[]
    songIds?: id[]
    coverType?: "neuro" | "evil" | "duet" | null
}

class Album {
    get Id() { return this.id }
    /** @deprecated Use Album.Id instead */ 
    get uuid() { return this.id }
    get Date() { return this.date }
    get Singers() { return this.singers }
    get SongIds() { return this.songIds }
    get CoverType() { return this.coverType }

    get Songs() { 
        if (!this.songsLoaded) {
            console.warn("Album songs not loaded")
        }
        return this.songs 
    }
    get PrettyDate() {
        return this.date.toLocaleDateString("en-AU", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    }
    get Title() { 
        return this.singers.join(" and ") + " Karaoke"
    }
    get Cover() {
        if (this.songIds.length === 1) {
            if (this.songsLoaded) {
                return this.songs[0]?.Cover
            }
            return this.songIds[0]
        }
        return this.coverType
    }

    private readonly id: id
    private date: Date
    private singers: string[]
    private coverType: "neuro" | "evil" | "duet" | null
    private songIds: id[]
    private songs: Array<Song>;
    private songsLoaded: boolean;

    constructor(options: AlbumPrams) {
        this.id = options.id
        this.date = new Date(options.date)
        this.singers = options.singers
        this.coverType = options.coverType ?? null
        this.songIds = options.songIds ?? []
        this.songs = []
        this.songsLoaded = false
    }
    async GetSongs() {
        if (this.songsLoaded) {
            return this.songs
        }
        // @ts-ignore
        this.songs = await Network.GetSong(this.songIds)
        this.songs = this.songs.sort((a, b) => a.Title.localeCompare(b.Title))
        this.songsLoaded = true
        return this.songs
    }
}