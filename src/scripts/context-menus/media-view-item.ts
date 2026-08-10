import { ReplaceEmotesOfString } from "@ts/emote"
import { RemoveSongsFromPlaylist } from "@ts/api/playlist"
import { Playlist } from "@ts/models/playlist"
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

            RemoveSongsFromPlaylist(media.id, [event.id])
            MediaView.Update(media)

            ToastManager.Toast(`Removed from <b>${ReplaceEmotesOfString(media.title)}</b>`, "none", 3, true)
        })
    ])
])