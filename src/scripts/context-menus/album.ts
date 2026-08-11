import { ContextGroup, ContextMenu, ContextOption } from "@ts/ui/context-menu"
import SelectPlaylist from "@ts/ui/popups/select-playlist"
import ToastManager from "@ts/ui/toast-manager"
import PlaybackController from "@ts/playback"
import { GetCollection, GetSongsOfCollection } from "@ts/api/collection"
import PlaylistProvider from "@ts/playlist-provider"

ContextMenu.AddCategory("album", [
    new ContextGroup("queue", false, false, [
        new ContextOption("Play Now", "/icons/play.svg", async (event) => {
            const album = await GetCollection(event.id)
            if (!album) {
                return
            }
            PlaybackController.Play({ songs: await album.GetSongs() })
        }),
    ]),
    new ContextGroup("playlist", true, false, [
        new ContextOption("Add Songs To Playlist", "/icons/playlist-add.svg", async (event) => {
            const playlistid = await SelectPlaylist.AskUser()
            if (playlistid === null) {
                return
            }

            try {
                const songIds = await GetSongsOfCollection(event.id)

                await PlaylistProvider.AddSongsToPlaylist(playlistid, songIds)
                ToastManager.Toast(`Added ${songIds.length} songs to playlist`, "none", 3, true)
            } catch (e) {
                ToastManager.Toast("Failed to add songs to playlist", "error")
                console.error(e)
            }
        }),
    ])
])