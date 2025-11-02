function UpdateNowPlaying() {
    ClearNowPlaying()
    if (SongQueue.songCount === 0) {
        return
    }
    const nowPlaying = document.querySelector("#now-playing");
    const list = new SongList(SongQueue.nextSongs, OnNowPlayingItemClick, "now-playing-item")
    nowPlaying.appendChild(list.CreateElement())
}
function ClearNowPlaying() {
    const nowPlaying = document.querySelector("#now-playing > .song-list");
    if (nowPlaying !== null) {
        nowPlaying.remove()
    }
}
function OnNowPlayingItemClick(event) {
    const uuid = event.target.dataset.uuid
    const song = SongQueue.GetSong(uuid)
    if (song === undefined) {
        console.warn("Item clicked with no song")
        return
    }
    SongQueue.SkipSong(song)
    UpdateNowPlaying()
    Audio.Play(song)
}

function DisplaySong(song) {
    const url = Network.GetCoverUrl(song.uuid, 256)
    document.getElementById("current-song-title").textContent = song.title
    document.getElementById("current-song-artist").textContent = song.artist
    document.querySelector("#current-song-bar > .cover").src = url
    document.querySelector("#current-song-bar .cover-artist").children[1].textContent = song.coverArtist.replace(",", "\n")
    navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: song.artist,
        artwork: [
            { src: url, sizes: "256x256", type: "image/png" }
        ]
    })
}