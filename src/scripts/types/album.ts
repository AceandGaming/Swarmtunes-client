import SongRequester from "@ts/song-requester"
import type { Song } from "@ts/types/song"

interface AlbumPrams {
    id: id
    date: string
    singers: string[]
    songIds?: id[]
    cover: string
}

export class Album {
    get Type() { return "Setlist" }
    get Id() { return this.id }
    get Date() { return this.date }
    get Singers() { return this.singers }
    get SongIds() { return this.songIds }
    get Cover() { return this.cover }

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
        })
    }
    get Title() {
        return this.singers.join(" and ") + " Karaoke"
    }
    get CoverUrl(): string {
        return this.Cover ? window.Network.GetCover(this.Cover) : "src/assets/no-song.png"
    }


    private readonly id: id
    private date: Date
    private singers: string[]
    private cover: string
    private songIds: id[]
    private songs: Array<Song>
    private songsLoaded: boolean

    constructor(options: AlbumPrams) {
        this.id = options.id
        this.date = new Date(options.date)
        this.singers = options.singers
        this.cover = options.cover ?? null
        this.songIds = options.songIds ?? []
        this.songs = []
        this.songsLoaded = false
    }
    async GetSongs() {
        if (this.songsLoaded) {
            return this.songs
        }
        this.songs = await SongRequester.GetSongs(this.songIds)
        this.songs = this.songs.sort((a, b) => a.Title.localeCompare(b.Title))
        this.songsLoaded = true
        return this.songs
    }
}