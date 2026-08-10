import SongProvider from "@ts/song-provider"
import { ContextGroup, ContextMenu, ContextOption } from "@ts/ui/context-menu"
import SelectPlaylist from "@ts/ui/popups/select-playlist"
import ToastManager from "@ts/ui/toast-manager"
import PlaybackController from "@ts/playback"
import { AddSongsToPlaylist } from "@ts/api/playlist"

ContextMenu.AddCategory("song", [
    new ContextGroup("queue", false, false, [
        new ContextOption("Add to Queue", "/icons/plus.svg", async (event: { id: string }) => {
            const song = await SongProvider.Get(event.id)
            if (!song) {
                return
            }

            PlaybackController.AddToQueue(song)
        }),
    ]),
    new ContextGroup("playlist", true, false, [
        new ContextOption("Add to Playlist", "/icons/playlist-add.svg", async (event: { id: string }) => {
            const playlistid = await SelectPlaylist.AskUser()
            if (playlistid === null) {
                return
            }

            try {
                await AddSongsToPlaylist(playlistid, [event.id])
            }
            catch (e) {
                ToastManager.Toast("Failed to add song to playlist", "error")
                console.error(e)
            }

            ToastManager.Toast(`Added song to playlist`)
        })
    ]),
    // new ContextGroup("share", false, true, [
    //     new ContextOption("Share", "/icons/share.svg", async (event: { id: string }) => {
    //         const url = "https://share.swarmtunes.com/?s=" + (await Network.ShareSong(event.id))
    //         const corutine = navigator.clipboard.writeText(url)
    //         corutine.then(() => {
    //             ToastManager.Toast("Copied link to clipboard")
    //         })
    //         corutine.catch(() => {
    //             const window = new ShareWindow(url)
    //             window.Show()
    //         })
    //     }),
    //     new ContextOption("Export", "/icons/file-export.svg", (event: { id: string }) => {
    //         Network.DownloadSong(event.id, true)
    //     }),
    // ]),
    // new ContextGroup("admins", true, true, [
    //     new ContextOption("Edit", "/icons/edit.svg", async (event: { id: string }) => {
    //         const song = await SongProvider.Get(event.id)
    //         if (!song) {
    //             return
    //         }
    //         const popup = new EditSongPopup(song)
    //         popup.Show()
    //     }, () => {
    //         return Network.IsAdmin()
    //     }),
    // ])
])
