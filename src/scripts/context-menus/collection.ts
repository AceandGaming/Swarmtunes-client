import PlaybackController from "@ts/playback"
import PlaylistProvider from "@ts/playlist-provider"
import type { Collection } from "@ts/models/collection"
import { ContextMenuGroup, type ContextMenuOption } from "@ts/context-menu.svelte"
import { IconPlaylistAdd, IconPlayerPlayFilled } from "@tabler/icons-svelte-runes"
import { auth } from "@ts/login.svelte"

export function CreateCollectionContextMenu(collection: Collection): ContextMenuOption[] {
    return [
        {
            label: "Play Now",
            icon: IconPlayerPlayFilled,
            Action: async () => PlaybackController.Play({ songs: await collection.GetSongs() })
        },
        {
            label: "Add To Libary",
            group: ContextMenuGroup.Playlist,
            icon: IconPlaylistAdd,
            Action: async () => {
                await collection.LoadSongs()
                PlaylistProvider.CreatePlaylist(collection.title, collection.GetSongIds())
            },
            visible: auth.loggedIn
        }
    ]
}