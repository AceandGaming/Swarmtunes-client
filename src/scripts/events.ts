import AudioPlayer from "@ts/audio"
import Network from "@ts/network"
import { PlaybackController } from "@ts/playback"
import PlaylistManager from "@ts/playlist-manager"
import SongQueue from "@ts/song-queue"
import SongRequester from "@ts/song-requester"
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


export function OnSongClick(event: any) {
    const id = event.target.dataset.id
    AudioPlayer.instance.Preload(id)
    SongRequester.GetSong(id).then((song) => {
        if (song === undefined) {
            console.warn("Song clicked with no song")
            return
        }
        PlaybackController.PlaySong(song)
        SongQueue.LoadSingleSong(song)
    })
}


export function OnPlaylistClick(event: any) {
    const id = event.target.dataset.id
    PlaylistManager.DisplayPlaylist(id)
}



