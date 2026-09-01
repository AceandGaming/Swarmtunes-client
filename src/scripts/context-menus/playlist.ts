import PlaybackController from "@ts/playback"
import PlaylistProvider from "@ts/playlist-provider"
import { ContextMenuGroup, type ContextMenuOption } from "@ts/context-menu.svelte"
import type { Playlist } from "@ts/models/playlist"
import { IconPlus, IconPlaylistAdd, IconTrash, IconEdit, IconPlayerPlayFilled } from "@tabler/icons-svelte-runes"
import * as Popups from "@ts/ui/popup.svelte.ts"

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
            Action: () => Popups.RenamePlaylist(playlist)
        },
        {
            label: "Delete",
            group: ContextMenuGroup.Edit,
            icon: IconTrash,
            visible: playlist.type === "user",
            Action: async () => {
                const confirmation = await Popups.ConfirmAction(`You are about to delete\n${playlist.title}`)
                if (!confirmation) {
                    return
                }
                await PlaylistProvider.DeletePlaylist(playlist.id)
            }
        },
        {
            label: "Add To Playlist",
            group: ContextMenuGroup.Playlist,
            icon: IconPlaylistAdd,
            Action: async () => {
                const otherPlaylist = await Popups.SelectPlaylist()
                if (!otherPlaylist || playlist.id === otherPlaylist.id) {
                    return
                }
                const songIds = playlist.GetSongIds()

                try {
                    await PlaylistProvider.AddSongsToPlaylist(otherPlaylist.id, songIds)
                }
                catch (e) {
                    console.error(e)
                }
            }
        },
        {
            label: "New Playlist",
            group: ContextMenuGroup.Playlist,
            icon: IconPlus,
            Action: () => Popups.CreatePlaylist()
        }
    ]
}