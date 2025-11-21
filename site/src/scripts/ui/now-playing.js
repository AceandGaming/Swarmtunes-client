function OnNowPlayingItemClick(event) {
    const uuid = event.target.dataset.uuid
    if (uuid === "swarmfm") {
        return
    }
    const song = SongQueue.GetSong(uuid)
    if (song === undefined) {
        console.warn("Item clicked with no song")
        return
    }
    SongQueue.SkipSong(song)
    NowPlaying.Update()
    AudioPlayer.instance.Play(song)
}

class NowPlaying {
    static #songlist
    static #element = document.querySelector("#now-playing")

    static Update(songs = undefined) {
        if (songs === undefined) {
            songs = SongQueue.nextSongs
        }
        if (this.#songlist === undefined) {
            this.#songlist = new SongList(songs, OnNowPlayingItemClick, "now-playing-item", false)
            const element = this.#songlist.CreateElement()

            const sortable = new Sortable(element, {
                animation: 150,
                dataIdAttr: "data-uuid"
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
        this.#songlist.songs = []
        this.#songlist.Update()
    }
}