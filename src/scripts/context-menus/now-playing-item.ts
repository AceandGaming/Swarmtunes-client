import { ReplaceEmotesOfString } from "@ts/emote"
import PlaylistManager from "@ts/playlist-manager"
import { PlaylistRequester } from "@ts/playlist-requester"
import SongQueue from "@ts/song-queue"
import { PlaylistView } from "@ts/ui/content/media-view"
import { ContextGroup, ContextMenu, ContextOption } from "@ts/ui/context-menu"
import { NowPlaying } from "@ts/ui/now-playing"
import ToastManager from "@ts/ui/toast-manager"

ContextMenu.InheritCategory("now-playing-item", "song", [
    new ContextGroup("queue", false, false, [
        new ContextOption("Remove", "src/assets/icons/trash.svg", (event) => {
            SongQueue.RemoveSong(event.id)
            NowPlaying.Update()
        }),
        new ContextOption("Clear Queue", "src/assets/icons/x-img.svg", () => {
            SongQueue.ClearSongQueue()
        }),
    ]),
    new ContextGroup("playlist", true, false, [
        new ContextOption("Remove From Playlist", "src/assets/icons/playlist-remove.svg", async (event) => {
            const playlistid = NowPlaying.sourceId
            if (playlistid === undefined) {
                return
            }
            const playlist = PlaylistManager.GetPlaylist(playlistid)

            playlist.RemoveAtId(event.id)
            PlaylistRequester.RemoveSongFromPlaylist(playlistid, [event.id])
            PlaylistView.Update()

            SongQueue.RemoveSong(event.id)
            NowPlaying.Update()

            ToastManager.Toast(`Removed song from <b>${ReplaceEmotesOfString(playlist.Title)}</b>`, "none", 3, true)
        }, () => {
            if (NowPlaying.sourceId.startsWith("playlist")) {
                return true
            }
            return false
        })
    ])
])
