import MediaViewSvelte from "./media-view.svelte"
import { mount } from "svelte"
import type { Collection as Album } from "@ts/models/collection"
import { Playlist } from "@ts/models/playlist"

// I imagine the Svelte Devs looking at my code like:
// TF?

export class MediaView {
    public static get media() {
        return this.currentMedia
    }
    public static get isVisible() {
        return this.visible
    }

    private static mediaView: MediaViewSvelte
    private static currentMedia?: Album | Playlist
    private static visible = false

    public static Create() {
        this.mediaView = mount(MediaViewSvelte, { target: document.getElementById("content")! })
    }
    public static async Update(media: Album | Playlist) {
        this.currentMedia = media

        this.mediaView.UpdateMeta(
            media.title,
            media.displayDate ?? "",
            media.GetArtwork("medium"),
            media instanceof Playlist,
        )


        this.Show()

        this.mediaView.SetLoading(true)
        const songs = await media.GetSongs()
        this.mediaView.UpdateSongs(songs)
        this.mediaView.SetLoading(false)
    }

    public static Hide() {
        this.mediaView.Hide()
        this.visible = false
    }
    public static Show() {
        this.mediaView.Show()
        this.visible = true
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