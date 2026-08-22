import { GetItemsOfPlaylist } from "@ts/api/playlist"
import { GetCoverUrl } from "@ts/api/song"
import type { Song } from "@ts/models/song"
import SongProvider from "@ts/song-provider"

type PlaylistType = "user" | "liked_songs"
type PlaylistDict = {
    id: id,
    title: string,

    artworks: Record<string, string>,
    dateCreated: string,
    type: PlaylistType,

    songCount: number,
    seconds: number
}

export class Playlist {
    public get displayTitle() {
        return this.title
    }
    public get displayDate() {
        return this.dateCreated.toLocaleDateString("en-AU", {
            day: "numeric",
            month: "short",
            year: "numeric",
        })
    }
    public get songCount() {
        if (this.items) {
            return this.items.length
        }
        return this._songCount
    }


    private constructor(
        public readonly id: id,
        public readonly title: string,
        public readonly artworks: Record<string, string>,
        public readonly dateCreated: Date,
        public readonly type: PlaylistType,
        private readonly _songCount: number,
        public readonly seconds: number,
        private items?: { song: id, dateAdded: Date }[]
    ) { }

    public static FromDict(dict: PlaylistDict) {
        return new Playlist(
            dict.id,
            dict.title,
            dict.artworks,
            new Date(dict.dateCreated),
            dict.type,
            dict.songCount,
            dict.seconds
        )
    }

    public GetSongIds() {
        return this.items ? this.items.map((item) => item.song) : []
    }
    public async LoadSongs() {
        if (this.items) {
            return
        }

        const items = await GetItemsOfPlaylist(this.id)
        this.items = items.map((item) => ({ song: item.songId, dateAdded: new Date(item.dateAdded) }))
        this.items.sort((a, b) => a.dateAdded.getTime() - b.dateAdded.getTime())
    }
    public async GetSongs(): Promise<Song[]> {
        await this.LoadSongs()

        return await SongProvider.GetMany(this.GetSongIds())
    }

    public GetArtwork(size: "small" | "medium" | "large" = "medium") {
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


    public AddSong(id: id) {
        if (!this.items) {
            throw new Error("Playlist's songs have not been loaded yet")
        }
        if (this.items.find((item) => item.song == id)) {
            return
        }

        this.items.push({ song: id, dateAdded: new Date() })
    }
    public RemoveSong(id: id) {
        if (!this.items) {
            throw new Error("Playlist's songs have not been loaded yet")
        }

        this.items = this.items.filter((item) => item.song != id)
    }
}