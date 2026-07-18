import { ReplaceEmotesOfString } from "@ts/emote"
import PlaylistManager from "@ts/playlist-manager"
import { PlaylistRequester } from "@ts/playlist-requester"
import SongQueue from "@ts/song-queue"
import { ContextGroup, ContextMenu, ContextOption } from "@ts/ui/context-menu"
import ConfirmAction from "@ts/ui/popups/confirm-action"
import { CreatePlaylistPopup } from "@ts/ui/popups/create-playlist"
import { RenamePlaylistPopup } from "@ts/ui/popups/rename-playlist"
import SelectPlaylist from "@ts/ui/popups/select-playlist"
import ToastManager from "@ts/ui/toast-manager"

ContextMenu.AddCategory("playlist", [
    new ContextGroup("queue", false, false, [
        new ContextOption("Play Now", "src/assets/icons/play.svg", async (event) => {
            const playlist = await PlaylistManager.LoadPlaylist(event.id)
            SongQueue.PlayNow(playlist.Songs)
            // @ts-ignore
            PlaybackController.PlaySong(playlist.Songs[0])
        })
    ]),
    new ContextGroup("manage playlist", true, false, [
        new ContextOption("Rename", "src/assets/icons/edit.svg", (event) => {
            RenamePlaylistPopup.instance.Show(event.id)
        }),
        new ContextOption("Delete", "src/assets/icons/trash.svg", async (event) => {
            const confirmation = await ConfirmAction.AskUser("You are about to delete <strong>" + ReplaceEmotesOfString(PlaylistManager.GetPlaylist(event.id).Title) + "</strong>")
            if (!confirmation) {
                return
            }
            PlaylistManager.RemovePlaylist(event.id)
            ToastManager.Toast("Playlist Deleted")
        })
    ]),
    new ContextGroup("playlists", true, false, [
        new ContextOption("Add to Other Playlist", "src/assets/icons/playlist-add.svg", async (event) => {
            const id = event.id
            const otherId = await SelectPlaylist.AskUser()
            if (otherId === null) {
                return
            }
            if (id === otherId) {
                return
            }
            const playlist = await PlaylistManager.LoadPlaylist(id)
            const otherPlaylist = await PlaylistManager.LoadPlaylist(otherId)
            otherPlaylist.AddMultiple(playlist.Songs)
            PlaylistRequester.AddSongToPlaylist(otherId, playlist.SongIds)
            ToastManager.Toast(`Added ${playlist.SongIds.length} songs to ${playlist.Title}`)
        }),
        new ContextOption("New Playlist", "src/assets/icons/plus.svg", () => {
            CreatePlaylistPopup.instance.Show()
        })
    ])
])