import { ReplaceEmotesOfString } from "@ts/emote"
import PlaybackController from "@ts/playback"
import { ContextGroup, ContextMenu, ContextOption } from "@ts/ui/context-menu"
import ConfirmAction from "@ts/ui/popups/confirm-action"
import { CreatePlaylistPopup } from "@ts/ui/popups/create-playlist"
import { RenamePlaylistPopup } from "@ts/ui/popups/rename-playlist"
import SelectPlaylist from "@ts/ui/popups/select-playlist"
import ToastManager from "@ts/ui/toast-manager"
import { GetSongsOfPlaylist, GetPlaylist, DeletePlaylist, AddSongsToPlaylist } from "@ts/api/playlist"
import PlaylistStore from "@ts/playlist-store"

ContextMenu.AddCategory("playlist", [
    new ContextGroup("queue", false, false, [
        new ContextOption("Play Now", "/icons/play.svg", async (event) => {
            const playlist = await PlaylistStore.Get(event.id)
            if (!playlist) {
                return
            }

            PlaybackController.Play({ songs: await playlist.GetSongs() })
        })
    ]),
    new ContextGroup("manage playlist", true, false, [
        new ContextOption("Rename", "/icons/edit.svg", (event) => {
            RenamePlaylistPopup.instance.Show(event.id)
        }),
        new ContextOption("Delete", "/icons/trash.svg", async (event) => {
            const playlist = await PlaylistStore.Get(event.id)
            if (!playlist) {
                return
            }

            const confirmation = await ConfirmAction.AskUser("You are about to delete <strong>" + ReplaceEmotesOfString(playlist.title) + "</strong>")
            if (!confirmation) {
                return
            }
            DeletePlaylist(playlist.id)
            PlaylistStore.Delete(playlist.id)
            ToastManager.Toast("Playlist Deleted")
        })
    ]),
    new ContextGroup("playlists", true, false, [
        new ContextOption("Add to Other Playlist", "/icons/playlist-add.svg", async (event) => {
            const id = event.id
            const otherId = await SelectPlaylist.AskUser()
            if (otherId === null) {
                return
            }
            if (id === otherId) {
                return
            }
            const songIds = await GetSongsOfPlaylist(id)
            const otherPlaylist = await PlaylistStore.Get(otherId)
            if (!otherPlaylist) {
                return
            }

            AddSongsToPlaylist(otherId, songIds)
            ToastManager.Toast(`Added ${songIds.length} songs to ${ReplaceEmotesOfString(otherPlaylist.title)}`, "none", 3, true)
        }),
        new ContextOption("New Playlist", "/icons/plus.svg", () => {
            CreatePlaylistPopup.instance.Show()
        })
    ])
])