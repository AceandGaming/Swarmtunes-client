import { ReplaceEmotesOfString } from "@ts/emote"
import Network from "@ts/network"
import PlaylistManager from "@ts/playlist-manager"
import { PlaylistRequester } from "@ts/playlist-requester"
import SongQueue from "@ts/song-queue"
import SongRequester from "@ts/song-requester"
import { PlaylistView } from "@ts/ui/content/media-view"
import { ContextGroup, ContextMenu, ContextOption } from "@ts/ui/context-menu"
import { EditSongPopup } from "@ts/ui/popups/edit-song"
import SelectPlaylist from "@ts/ui/popups/select-playlist"
import { ShareWindow } from "@ts/ui/popups/share-link"
import ToastManager from "@ts/ui/toast-manager"

ContextMenu.AddCategory("song", [
    new ContextGroup("queue", false, false, [
        new ContextOption("Add to Queue", "/icons/plus.svg", async (event: { id: string }) => {
            const song = await SongRequester.GetSong(event.id)
            if (!song) {
                return
            }
            SongQueue.AppendSong(song)
        }),
    ]),
    new ContextGroup("playlist", true, false, [
        new ContextOption("Add to Playlist", "/icons/playlist-add.svg", async (event: { id: string }) => {
            const playlistid = await SelectPlaylist.AskUser()
            if (playlistid === null) {
                return
            }
            const song = await SongRequester.GetSong(event.id)
            if (!song) {
                return
            }
            const playlist = PlaylistManager.GetPlaylist(playlistid)
            if (playlist.Has(event.id)) {
                ToastManager.Toast("Song already in playlist", "error")
                return
            }
            await playlist.GetSongs()
            playlist.Add(song)
            PlaylistRequester.AddSongToPlaylist(playlistid, [event.id])
            PlaylistView.Update()
            ToastManager.Toast(`Added song to <b>${ReplaceEmotesOfString(playlist.Title)}</b>`, "none", 3, true)
        })
    ]),
    new ContextGroup("share", false, true, [
        new ContextOption("Share", "/icons/share.svg", async (event: { id: string }) => {
            const url = "https://share.swarmtunes.com/?s=" + (await Network.ShareSong(event.id))
            const corutine = navigator.clipboard.writeText(url)
            corutine.then(() => {
                ToastManager.Toast("Copied link to clipboard")
            })
            corutine.catch(() => {
                const window = new ShareWindow(url)
                window.Show()
            })
        }),
        new ContextOption("Export", "/icons/file-export.svg", (event: { id: string }) => {
            Network.DownloadSong(event.id, true)
        }),
    ]),
    new ContextGroup("admins", true, true, [
        new ContextOption("Edit", "/icons/edit.svg", async (event: { id: string }) => {
            const song = await SongRequester.GetSong(event.id)
            if (!song) {
                return
            }
            const popup = new EditSongPopup(song)
            popup.Show()
        }, () => {
            return Network.IsAdmin()
        }),
    ])
])