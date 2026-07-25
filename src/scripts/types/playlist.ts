import SongRequester from "@ts/song-requester"
import type { Song } from "@ts/types/song"

interface PlaylistPrams {
    id: id
    title: string
    singers: String[]
    date: string
    cover: string
    songIds?: id[]
}

export class Playlist {
    get Type() { return "Playlist" }
    get Id() { return this.id }
    get Title() { return this.title }
    set Title(title) {
        this.title = title
    }
    get Singers() { return this.singers }
    get Date() { return this.date }
    get SongIds() { return this.songIds }
    get IsLoaded() { return this.songsLoaded }

    get Songs() {
        if (!this.songsLoaded) {
            console.warn("Playlist songs not loaded")
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
    get CoverUrl(): string {
        return this.coverUrl
    }


    private readonly id: id
    private title: string
    private singers: String[]
    private date: Date
    private coverUrl: string
    private songIds: id[]
    private songs: Song[]
    private songsLoaded

    constructor(options: PlaylistPrams) {
        this.id = options.id
        this.title = options.title
        this.singers = options.singers
        this.date = new Date(options.date)
        this.coverUrl = options.cover
        this.songIds = options.songIds ?? []
        this.songs = []
        this.songsLoaded = false
    }
    async GetSongs() {
        if (this.songsLoaded) {
            return this.songs
        }
        if (this.songIds.length > 0) {
            this.songs = await SongRequester.GetSongs(this.songIds)
        }
        this.songsLoaded = true
        return this.songs
    }
    Add(song: Song) {
        if (!this.songsLoaded) {
            throw new Error("Playlist songs not loaded")
        }
        if (this.songIds.includes(song.Id)) {
            return
        }
        this.songIds.push(song.Id)
        this.songs.push(song)
    }
    Has(song: id) {
        return this.songIds.includes(song)
    }
    AddMultiple(songs: Song[]) {
        for (const song of songs) {
            this.Add(song)
        }
    }
    AddIds(ids: id[]) {
        if (this.songsLoaded) {
            throw new Error("Playlist songs already loaded")
        }
        for (const id of ids) {
            if (this.songIds.includes(id)) {
                continue
            }
            this.songIds.push(id)
        }
    }
    Remove(song: Song) {
        if (!this.songsLoaded) {
            throw new Error("Playlist songs not loaded")
        }
        const index = this.songIds.indexOf(song.Id)
        this.songIds.splice(index, 1)
        this.songs.splice(index, 1)
    }
    RemoveIds(ids: id[]) {
        for (const id of ids) {
            this.RemoveAtId(id)
        }
    }
    RemoveAtId(id: id) {
        const index = this.songIds.indexOf(id)
        this.songIds.splice(index, 1)
        if (this.songsLoaded) {
            this.songs.splice(index, 1)
        }
    }

    ToJson() {
        return {
            id: this.id,
            title: this.title,
            singers: this.singers,
            date: this.date,
            cover: this.coverUrl,
            songIds: this.songIds
        }
    }
}
