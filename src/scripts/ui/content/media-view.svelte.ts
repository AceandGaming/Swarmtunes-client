import type { Collection, Playlist, Song } from "@ts/models"

type Media = Collection | Playlist | Song
let currentMedia: Media | undefined = $state.raw()

export default {
    get media() {
        return currentMedia
    },
    get visible() {
        return currentMedia !== undefined
    },

    Show(media: Media) {
        currentMedia = media
    },
    Hide() {
        currentMedia = undefined
    }
}