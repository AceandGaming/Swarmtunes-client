import PlaybackController from "@ts/playback"
import type { Song } from "@ts/models/song"
import SongList from "@ts/ui/item-list.svelte"
import { mount } from "svelte"

function OnNowPlayingItemClick(song: Song) {
    PlaybackController.SkipTo(song)
}

export class NowPlaying {
    private static songlist: SongList<Song>
    private static element = document.querySelector("#now-playing") as HTMLDivElement

    public static Create() {
        this.songlist = mount(SongList<Song>, {
            target: this.element,
            props: {
                items: [],
                animate: true,
                extraInfo: false,
                contextMenuButton: false,
                onItemClick: OnNowPlayingItemClick,
            },
        }) as SongList<Song>

        PlaybackController.AddCallback("queueChange", (songs) => this.Update(songs))
    }

    private static Update(songs: Song[]) {
        this.songlist.Update(songs)
    }
    // static Clear() {
    //     if (!this.songlist) {
    //         return
    //     }
    //     this.songlist.songs = []
    //     this.songlist.Update()
    // }
}
