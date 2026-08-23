import PlaybackController from "@ts/playback"
import PlaylistProvider from "@ts/playlist-provider"
import { ShareSongV1, ExportSong } from "@ts/api/song"
import { ContextMenuGroup, type ContextMenuOption } from "@ts/context-menu.svelte"
import { IconPlus, IconShare3, IconPlaylistAdd, IconFileExport } from "@tabler/icons-svelte-runes"
import type { Song } from "@ts/models/song"
import { SelectPlaylist, CopyToClipboard } from "@ts/ui/popup.svelte.ts"
import { auth } from "@ts/login.svelte"

export function CreateSongContextMenu(song: Song): ContextMenuOption[] {
    return [
        {
            label: "Add to Queue",
            group: ContextMenuGroup.Queue,
            icon: IconPlus,
            Action: () => PlaybackController.AddToQueue(song)
        },
        {
            label: "Add to Playlist",
            group: ContextMenuGroup.Playlist,
            icon: IconPlaylistAdd,
            Action: async () => {
                const playlist = await SelectPlaylist()
                if (!playlist) {
                    return
                }

                try {
                    await PlaylistProvider.AddSongsToPlaylist(playlist.id, [song.id])
                } catch (e) {
                    console.error(e)
                }
            },
            visible: auth.loggedIn
        },
        {
            label: "Share",
            group: ContextMenuGroup.Share,
            icon: IconShare3,
            Action: async () => {
                const url = "https://share.swarmtunes.com/?s=" + (await ShareSongV1(song.id))
                try {
                    CopyToClipboard(url)
                }
                catch {
                    console.error("Failed to copy link to clipboard")
                }
            }
        },
        {
            label: "Export",
            group: ContextMenuGroup.Share,
            icon: IconFileExport,
            Action: () => ExportSong(song.id)
        }
    ]
}