import SelectPlaylist from "@ts/ui/popups/select-playlist"
import ToastManager from "@ts/ui/toast-manager"
import PlaybackController from "@ts/playback"
import PlaylistProvider from "@ts/playlist-provider"
import { ShareSongV1, ExportSong } from "@ts/api/song"
import { ShareWindow } from "@ts/ui/popups/share-link"
import { ContextMenuGroup, type ContextMenuOption } from "@ts/context-menu.svelte"
import { IconPlus, IconShare3, IconPlaylistAdd, IconFileExport } from "@tabler/icons-svelte-runes"
import type { Song } from "@ts/models/song"


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
                const playlistid = await SelectPlaylist.AskUser()
                if (!playlistid) {
                    return
                }

                try {
                    await PlaylistProvider.AddSongsToPlaylist(playlistid, [song.id])
                    ToastManager.Toast(`Added song to playlist`, "none", 3, true)
                } catch (e) {
                    ToastManager.Toast("Failed to add songs to playlist", "error")
                    console.error(e)
                }
            }
        },
        {
            label: "Share",
            group: ContextMenuGroup.Share,
            icon: IconShare3,
            Action: async () => {
                const url = "https://share.swarmtunes.com/?s=" + (await ShareSongV1(song.id))
                const corutine = navigator.clipboard.writeText(url)
                corutine.then(() => {
                    ToastManager.Toast("Copied link to clipboard")
                })
                corutine.catch(() => {
                    const window = new ShareWindow(url)
                    window.Show()
                })
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