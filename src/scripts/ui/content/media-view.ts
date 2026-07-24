import MediaViewSvelte from "./media-view.svelte"
import { mount } from "svelte"
import type { Album } from "@ts/types/album"
import type { Playlist } from "@ts/types/playlist"
import Network from "@ts/network"

// I imagine the Svelte Devs looking at my code like:
// TF?

export class MediaView {
    private static mediaView: MediaViewSvelte

    public static Create() {
        this.mediaView = mount(MediaViewSvelte, { target: document.getElementById("content")! })
    }
    public static async Update(media: Album | Playlist) {
        this.mediaView.UpdateMeta(
            media.Title,
            media.PrettyDate,
            Network.GetCover(media.Cover as string, 512)
        )
        this.Show()

        this.mediaView.SetLoading(true)
        const songs = await media.GetSongs()
        this.mediaView.UpdateSongs(songs)
        this.mediaView.SetLoading(false)
    }

    public static Hide() {
        this.mediaView.Hide()

    }
    public static Show() {
        this.mediaView.Show()

    }

    /**@deprecated*/
    static ShowLoading() { }
    /**@deprecated*/
    static IsVisible() {
        return true
    }
    /**@deprecated*/
    static ClearMediaId(id: any) { }
}

/**@deprecated Use MediaView.Update instead*/
export class AlbumView {
    static async Show(album: Album) {
        MediaView.Update(album)
    }
}

/**@deprecated Use MediaView.Update instead */
export class PlaylistView {
    static playlist?: Playlist
    static async Show(playlist: Playlist) {
        MediaView.Update(playlist)
    }
    static Update() {
        if (!this.playlist) {
            return
        }
        this.Show(this.playlist)
    }
}