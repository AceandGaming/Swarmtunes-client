import { ReplaceEmotesOfString } from "@ts/emote"
import Network from "@ts/network"
import PlaylistManager from "@ts/playlist-manager"
import { PlaylistRequester } from "@ts/playlist-requester"
import { ContextGroup, ContextMenu, ContextOption } from "@ts/ui/context-menu"
import SelectPlaylist from "@ts/ui/popups/select-playlist"
import ToastManager from "@ts/ui/toast-manager"
import PlaybackController from "@ts/playback"

ContextMenu.AddCategory("album", [
    new ContextGroup("queue", false, false, [
        new ContextOption("Play Now", "/icons/play.svg", async (event) => {
            const album = await Network.GetAlbum(event.id, true)

            PlaybackController.Play({ songs: album.songs })
        }),
    ]),
    new ContextGroup("playlist", true, false, [
        new ContextOption("Add Songs To Playlist", "/icons/playlist-add.svg", async (event) => {
            const playlistid = await SelectPlaylist.AskUser()
            if (playlistid === null) {
                return
            }
            const playlist = PlaylistManager.GetPlaylist(playlistid)
            await playlist.GetSongs()
            const album = await Network.GetAlbum(event.id, true)
            playlist.AddMultiple(album.songs)
            PlaylistRequester.AddSongToPlaylist(playlistid, album.songIds)
            ToastManager.Toast(`Added ${album.songIds.length} songs to <b>${ReplaceEmotesOfString(playlist.Title)}</b>`, "none", 3, true)
        }),
    ])
])