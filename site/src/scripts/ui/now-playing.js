function OnNowPlayingItemClick(event) {
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

class NowPlaying {
    static #songlist
    static #element = document.querySelector("#now-playing")

    static Update(songs = undefined) {
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
            sortable.option("onEnd", (evt) => {
                SongQueue.OnQueueOrderChange(sortable.toArray())
            });

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



ContextMenu.InheritCategory("now-playing-item", "song", [
    new ContextGroup("queue", false, false, [
        new ContextOption("Remove", "src/assets/icons/playlist-remove.svg", (event) => {
            SongQueue.RemoveSong(event.id)
            NowPlaying.Update()
        }),
        new ContextOption("Clear Queue", "src/assets/icons/x-img.svg", (event) => {
            SongQueue.ClearSongQueue()
        }),
    ])
])