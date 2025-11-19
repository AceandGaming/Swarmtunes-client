function UpdateNowPlaying(swarmfm = false) {
    ClearNowPlaying()
    if (SongQueue.songCount === 0 && !swarmfm) {
        return
    }
    const nowPlaying = document.querySelector("#now-playing");
    let songs = []
    // if (swarmfm) {
    //     songs = [SwarmFM.song]
    // }
    //else {
    songs = SongQueue.nextSongs
    //}
    const list = new SongList(songs, OnNowPlayingItemClick, "now-playing-item")
    const element = list.CreateElement()
    const sortable = new Sortable(element, {
        animation: 150,
        dataIdAttr: "data-uuid"
    })
    sortable.option("onEnd", (evt) => {
        SongQueue.OnQueueOrderChange(sortable.toArray())
    });
    nowPlaying.appendChild(element)
}
function ClearNowPlaying() {
    const nowPlaying = document.querySelector("#now-playing > .song-list");
    if (nowPlaying !== null) {
        nowPlaying.remove()
    }
}
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
    UpdateNowPlaying()
    Audio.Play(song)
}

