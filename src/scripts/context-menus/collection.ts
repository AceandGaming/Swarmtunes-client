// import SelectPlaylist from "@ts/ui/popups/select-playlist"
import ToastManager from "@ts/ui/toast-manager"
import PlaybackController from "@ts/playback"
import PlaylistProvider from "@ts/playlist-provider"
import type { Collection } from "@ts/models/collection"
import { ContextMenuGroup, type ContextMenuOption } from "@ts/context-menu.svelte"
import { IconPlaylistAdd, IconPlayerPlayFilled } from "@tabler/icons-svelte-runes"
import { SelectPlaylist } from "@ts/ui/popup.svelte.ts"

export function CreateCollectionContextMenu(collection: Collection): ContextMenuOption[] {
    return [
        {
            label: "Play Now",
            icon: IconPlayerPlayFilled,
            Action: async () => PlaybackController.Play({ songs: await collection.GetSongs() })
        },
        {
            label: "Add To Playlist",
            group: ContextMenuGroup.Playlist,
            icon: IconPlaylistAdd,
            Action: async () => {
                const playlistid = await SelectPlaylist()
                if (!playlistid) {
                    return
                }

                await collection.LoadSongs()
                const songIds = collection.GetSongIds()

                try {
                    await PlaylistProvider.AddSongsToPlaylist(playlistid, songIds)
                    ToastManager.Toast(`Added ${songIds.length} songs to playlist`, "none", 3, true)
                } catch (e) {
                    ToastManager.Toast("Failed to add songs to playlist", "error")
                    console.error(e)
                }
            }
        }
    ]
}