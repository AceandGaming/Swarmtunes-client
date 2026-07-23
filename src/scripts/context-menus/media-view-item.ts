import { ReplaceEmotesOfString } from "@ts/emote"
import PlaylistManager from "@ts/playlist-manager"
import { PlaylistRequester } from "@ts/playlist-requester"
import { PlaylistView } from "@ts/ui/content/media-view"
import { ContextGroup, ContextMenu, ContextOption } from "@ts/ui/context-menu"
import ToastManager from "@ts/ui/toast-manager"

ContextMenu.InheritCategory("playlist-item", "song", [
    new ContextGroup("playlist", true, false, [
        new ContextOption("Remove From Playlist", "/icons/playlist-remove.svg", async (event) => {
            const playlistid = PlaylistView.playlist.Id
            if (playlistid === undefined) {
                return
            }
            const playlist = PlaylistManager.GetPlaylist(playlistid)
            playlist.RemoveAtId(event.id)
            PlaylistRequester.RemoveSongFromPlaylist(playlistid, [event.id])
            PlaylistView.Update()
            ToastManager.Toast(`Removed from <b>${ReplaceEmotesOfString(playlist.Title)}</b>`, "none", 3, true)
        })
    ])
])