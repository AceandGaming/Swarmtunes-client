import PlaybackController from "@ts/playback"
import type { Song } from "@ts/models/song"
import { SongList } from "@ts/ui/song-list"
import Sortable from "sortablejs"

function OnNowPlayingItemClick(song: Song) {
    PlaybackController.SkipTo(song)
}

export class NowPlaying {
    private static songlist: SongList
    private static element = document.querySelector("#now-playing") as HTMLDivElement

    public static Create() {
        this.songlist = new SongList([], OnNowPlayingItemClick, "now-playing-item", false, 30)

        const sortable = new Sortable(this.songlist.element, {
            animation: 150,
            dataIdAttr: "data-id"
        })
        // sortable.option("onEnd", () => {
        //     SongQueue.OnQueueOrderChange(sortable.toArray())
        // })

        this.element.appendChild(this.songlist.element)

        PlaybackController.AddCallback("queueChange", (songs) => this.Update(songs))
    }

    private static Update(songs: Song[]) {
        this.songlist.songs = songs
        this.songlist.UpdateAnimated()
    }
    // static Clear() {
    //     if (!this.songlist) {
    //         return
    //     }
    //     this.songlist.songs = []
    //     this.songlist.Update()
    // }
}
