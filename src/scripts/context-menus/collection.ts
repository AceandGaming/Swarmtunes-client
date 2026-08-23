import PlaybackController from "@ts/playback"
import PlaylistProvider from "@ts/playlist-provider"
import type { Collection } from "@ts/models/collection"
import { ContextMenuGroup, type ContextMenuOption } from "@ts/context-menu.svelte"
import { IconPlaylistAdd, IconPlayerPlayFilled } from "@tabler/icons-svelte-runes"
import { SelectPlaylist } from "@ts/ui/popup.svelte.ts"
import { auth } from "@ts/login.svelte"

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
                const playlist = await SelectPlaylist()
                if (!playlist) {
                    return
                }

                await collection.LoadSongs()
                const songIds = collection.GetSongIds()

                try {
                    await PlaylistProvider.AddSongsToPlaylist(playlist.id, songIds)
                } catch (e) {
                    console.error(e)
                }
            },
            visible: auth.loggedIn
        }
    ]
}