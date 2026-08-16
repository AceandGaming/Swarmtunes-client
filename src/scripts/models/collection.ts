import { GetSongsOfCollection } from "@ts/api/collection"
import { GetCoverUrl } from "@ts/api/song"
import type { Song } from "@ts/models/song"
import SongProvider from "@ts/song-provider"

type CollectionDict = {
    id: id,

    title: string
    artworks: Record<string, string>
    date?: string
    disc?: number

    songCount: number
    seconds: number
}

export class Collection {
    public get displayTitle() {
        return this.title
    }
    public get displayDate() {
        return this.date?.toLocaleDateString("en-AU", {
            day: "numeric",
            month: "short",
            year: "numeric",
        })
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
        public readonly date: Date | undefined,
        public readonly disc: number | undefined,

        public readonly _songCount: number,
        public readonly seconds: number,

        private songIds?: id[]
    ) { }
    public static FromDict(dict: CollectionDict) {
        return new Collection(
            dict.id,
            dict.title,
            dict.artworks,
            dict.date ? new Date(dict.date) : undefined,
            dict.disc,
            dict.songCount,
            dict.seconds
        )
    }
    public GetArtwork(size: "small" | "medium" | "large" = "medium") {
        //temp
        const artworks = Object.fromEntries(Object.entries(this.artworks).map(([key, value]) => [key, `${key}/${value}`]))
        let art
        if (this.disc != undefined) {
            art = artworks["disc"]
        }
        else {
            art = (
                artworks["custom"]
                || artworks["default"]
                || artworks["disc"]
                || artworks["plush"]
            )
        }

        return GetCoverUrl(art, size)
    }

    public GetSongIds() {
        return this.songIds ?? []
    }
    public async LoadSongs() {
        if (this.songIds == undefined) {
            this.songIds = await GetSongsOfCollection(this.id)
        }
    }
    public async GetSongs(): Promise<Song[]> {
        await this.LoadSongs()

        return await SongProvider.GetMany(this.GetSongIds())
    }
}