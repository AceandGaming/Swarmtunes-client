import { ReplaceEmotesOfString } from "@ts/emote"
import PlaybackController from "@ts/playback"
import ConfirmAction from "@ts/ui/popups/confirm-action"
import { CreatePlaylistPopup } from "@ts/ui/popups/create-playlist"
import { RenamePlaylistPopup } from "@ts/ui/popups/rename-playlist"
import SelectPlaylist from "@ts/ui/popups/select-playlist"
import ToastManager from "@ts/ui/toast-manager"
import PlaylistProvider from "@ts/playlist-provider"
import { ContextMenuGroup, type ContextMenuOption } from "@ts/context-menu.svelte"
import type { Playlist } from "@ts/models/playlist"
import { IconPlus, IconPlaylistAdd, IconTrash, IconEdit, IconPlayerPlayFilled } from "@tabler/icons-svelte-runes"

export function CreatePlaylistContextMenu(playlist: Playlist): ContextMenuOption[] {
    return [
        {
            label: "Play Now",
            icon: IconPlayerPlayFilled,
            Action: async () => PlaybackController.Play({ songs: await playlist.GetSongs() })
        },
        {
            label: "Rename",
            group: ContextMenuGroup.Edit,
            icon: IconEdit,
            Action: () => RenamePlaylistPopup.instance.Show(playlist.id) //This should take in a playlist not id
        },
        {
            label: "Delete",
            group: ContextMenuGroup.Edit,
            icon: IconTrash,
            Action: async () => {
                const confirmation = await ConfirmAction.AskUser("You are about to delete <strong>" + ReplaceEmotesOfString(playlist.title) + "</strong>")
                if (!confirmation) {
                    return
                }
                await PlaylistProvider.DeletePlaylist(playlist.id)
                ToastManager.Toast("Playlist Deleted!")
            }
        },
        {
            label: "Add To Playlist",
            group: ContextMenuGroup.Playlist,
            icon: IconPlaylistAdd,
            Action: async () => {
                const otherId = await SelectPlaylist.AskUser()
                if (!otherId || playlist.id === otherId) {
                    return
                }
                const songIds = playlist.GetSongIds()
                const otherPlaylist = await PlaylistProvider.Get(otherId)

                try {
                    await PlaylistProvider.AddSongsToPlaylist(otherId, songIds)
                    ToastManager.Toast(`Added ${songIds.length} songs to ${ReplaceEmotesOfString(otherPlaylist.title)}`, "none", 3, true)
                }
                catch (e) {
                    ToastManager.Toast("Failed to add songs to playlist", "error")
                    console.error(e)
                }
            }
        },
        {
            label: "New Playlist",
            group: ContextMenuGroup.Playlist,
            icon: IconPlus,
            Action: () => CreatePlaylistPopup.instance.Show()
        }
    ]
}