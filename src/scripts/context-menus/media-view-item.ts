import { ReplaceEmotesOfString } from "@ts/emote"
import { PlaylistRequester } from "@ts/playlist-requester"
import { Playlist } from "@ts/types/playlist"
import { MediaView } from "@ts/ui/content/media-view"
import { ContextGroup, ContextMenu, ContextOption } from "@ts/ui/context-menu"
import ToastManager from "@ts/ui/toast-manager"

ContextMenu.InheritCategory("playlist-item", "song", [
    new ContextGroup("playlist", true, false, [
        new ContextOption("Remove From Playlist", "/icons/playlist-remove.svg", async (event) => {
            const media = MediaView.media
            if (!(media instanceof Playlist)) {
                return
            }

            media.RemoveAtId(event.id)
            PlaylistRequester.RemoveSongFromPlaylist(media.Id, [event.id])
            MediaView.Update(media)

            ToastManager.Toast(`Removed from <b>${ReplaceEmotesOfString(media.Title)}</b>`, "none", 3, true)
        })
    ])
])