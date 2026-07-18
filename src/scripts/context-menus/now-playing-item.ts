import SongQueue from "@ts/song-queue"
import { ContextGroup, ContextMenu, ContextOption } from "@ts/ui/context-menu"
import { NowPlaying } from "@ts/ui/now-playing"

ContextMenu.InheritCategory("now-playing-item", "song", [
    new ContextGroup("queue", false, false, [
        new ContextOption("Remove", "src/assets/icons/trash.svg", (event) => {
            SongQueue.RemoveSong(event.id)
            NowPlaying.Update()
        }),
        new ContextOption("Clear Queue", "src/assets/icons/x-img.svg", () => {
            SongQueue.ClearSongQueue()
        }),
    ])
])
