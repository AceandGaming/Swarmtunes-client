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
    get CoverUrl() { return this.coverUrl }

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



    private readonly id: id
    private date: Date
    private singers: string[]
    private songIds: id[]
    private songs: Array<Song>
    private songsLoaded: boolean
    private coverUrl: string

    constructor(options: AlbumPrams) {
        this.id = options.id
        this.date = new Date(options.date)
        this.singers = options.singers
        this.coverUrl = options.cover
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