import { Collection } from "@ts/models/collection"
import { Get } from "./network"
import { Song } from "@ts/models/song"

export async function GetCollection(id: id): Promise<Collection> {
    const json = await Get(`/collections/${id}`)
    return Collection.FromDict(json)
}
export async function GetCollections(ids: id[]): Promise<Collection[]> {
    const params = new URLSearchParams()

    for (const id of ids) {
        params.append("id", id)
    }

    const json = await Get(`/collections?${params.toString()}`)
    return json.map(Collection.FromDict)
}

export async function GetSongsOfCollection(id: id): Promise<id[]> {
    const json = await Get(`/collections/${id}/songs`)
    return json
}