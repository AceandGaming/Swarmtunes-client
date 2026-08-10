import { GetSongsOfPlaylist } from "@ts/api/playlist"
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
    public get songCount() {
        if (this.songIds) {
            return this.songIds.length
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
        private songIds?: id[]
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
        return this.songIds ?? []
    }
    public async GetSongs(): Promise<Song[]> {
        if (this.songIds == undefined) {
            this.songIds = await GetSongsOfPlaylist(this.id)
        }

        return await SongProvider.GetMany(this.songIds ?? [])
    }


    public AddSong(id: id) {
        if (!this.songIds) {
            throw new Error("Playlist's songs have not been loaded yet")
        }

        this.songIds.push(id)
    }
    public RemoveSong(id: id) {
        if (!this.songIds) {
            throw new Error("Playlist's songs have not been loaded yet")
        }

        this.songIds = this.songIds.filter((songId) => songId !== id)
    }
}