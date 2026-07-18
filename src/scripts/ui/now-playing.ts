import { PlaybackController } from "@ts/playback"
import SongQueue from "@ts/song-queue"
import type { Song } from "@ts/types/song"
import { SongList } from "@ts/ui/song-list"
import Sortable from "sortablejs"

function OnNowPlayingItemClick(event: any) {
    const id = event.target.dataset.id
    if (id === "swarmfm") {
        return
    }
    const song = SongQueue.GetSong(id)
    if (song === undefined) {
        console.warn("Item clicked with no song")
        return
    }
    SongQueue.SkipSong(song)
    NowPlaying.Update()
    PlaybackController.PlaySong(song)
}

export class NowPlaying {
    static #songlist: SongList
    static #element = document.querySelector("#now-playing") as HTMLDivElement

    static Update(songs: Song[] | undefined = undefined) {
        if (songs === undefined) {
            songs = SongQueue.nextSongs
        }
        if (this.#songlist === undefined) {
            this.#songlist = new SongList(songs, OnNowPlayingItemClick, "now-playing-item", false, 30)
            const element = this.#songlist.CreateElement()

            const sortable = new Sortable(element, {
                animation: 150,
                dataIdAttr: "data-id"
            })
            sortable.option("onEnd", () => {
                SongQueue.OnQueueOrderChange(sortable.toArray())
            })

            this.#element.appendChild(element)
        } else {
            this.#songlist.songs = songs
            this.#songlist.UpdateAnimated()
        }
    }
    static Clear() {
        if (this.#songlist === undefined) {
            return
        }
        this.#songlist.songs = []
        this.#songlist.Update()
    }
}
