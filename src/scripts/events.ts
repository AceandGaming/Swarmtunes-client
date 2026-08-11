import PlaybackController from "@ts/playback"
import type { Song } from "@ts/types/song"
import { MediaView, AlbumView } from "@ts/ui/content/media-view"

export function OnAlbumClick(event: any) {
    const id = event.target.dataset.id
    MediaView.ShowLoading()
    Network.GetAlbum(id).then(album => {
        if (!MediaView.IsVisible()) {
            return
        }
        AlbumView.Show(album)
    })
}


export function OnSongClick(song: Song) {
    PlaybackController.Play({ song, songs: [song] })

}


export function OnPlaylistClick(event: any) {
    const id = event.target.dataset.id
    MediaView.Display(id)
}



