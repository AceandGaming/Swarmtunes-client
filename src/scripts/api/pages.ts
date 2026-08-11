import { Get } from "./network"
import { Song } from "@ts/models/song"
import { Collection } from "@ts/models/collection"

export async function GetDiscoverPage() {
    const json = await Get("/discover")
    return {
        setlists: json.setlists.map(Collection.FromDict) as Collection[],
        discs: json.discs.map(Collection.FromDict) as Collection[],
        originals: json.originals.map(Song.FromDict) as Song[],
        mashups: json.mashups.map(Song.FromDict) as Song[]
    }
}