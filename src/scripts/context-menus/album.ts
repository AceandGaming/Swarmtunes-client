import { ReplaceEmotesOfString } from "@ts/emote"
import Network from "@ts/network"
import PlaylistManager from "@ts/playlist-manager"
import { PlaylistRequester } from "@ts/playlist-requester"
import SongQueue from "@ts/song-queue"
import { ContextGroup, ContextMenu, ContextOption } from "@ts/ui/context-menu"
import SelectPlaylist from "@ts/ui/popups/select-playlist"
import ToastManager from "@ts/ui/toast-manager"

ContextMenu.AddCategory("album", [
    new ContextGroup("queue", false, false, [
        new ContextOption("Play Now", "src/assets/icons/play.svg", async (event) => {
            const album = await Network.GetAlbum(event.id, true)
            SongQueue.PlayNow(album.songs)
            // @ts-ignore
            PlaybackController.PlaySong(album.songs[0])
        }),
    ]),
    new ContextGroup("playlist", true, false, [
        new ContextOption("Add Songs To Playlist", "src/assets/icons/playlist-add.svg", async (event) => {
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
    ]),
    new ContextGroup("share", false, true, [
        // new ContextOption("Share", "src/assets/icons/share.svg", async (event) => {
        //     const url = "https://share.swarmtunes.com/?a=" + (await Network.ShareAlbum(event.id))
        //     navigator.clipboard.writeText(url)
        // }),
        new ContextOption("Export", "src/assets/icons/file-export.svg", (event) => {
            Network.GetAlbumMP3s(event.id)
        }),
    ])
])