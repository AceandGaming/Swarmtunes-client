class PlaylistView {
    static Load(songs, title, cover, subtitle = "", catagory = "song", uuid = "") {
        this.songs = songs
        this.title = title
        this.cover = cover
        this.subtitle = subtitle
        this.uuid = uuid
        this.playlistElement = document.getElementById("playlist-view")
        this.catagory = catagory

        this.onPlaylistItemClick = (event) => {
            const uuid = event.target.dataset.uuid
            Network.GetSong(uuid).then(song => LoadPlaylistItemToQueue(song, this.songs))
        }
    }
    static Show() {
        document.getElementById("content-tabs").style.display = "none"
        this.playlistElement.style.display = "block"
        this.playlistElement.querySelector(".subtitle").textContent = this.subtitle
        if (this.songs.length === 1) {
            this.playlistElement.querySelector(".cover").src = Network.GetCoverUrl(this.songs[0].uuid, 512)
            this.playlistElement.querySelector(".title").textContent = "Special Release"
        }
        else {
            this.playlistElement.querySelector(".cover").src = Network.GetCoverUrl(this.cover, 512)
            this.playlistElement.querySelector(".title").textContent = this.title
        }
        this.Update()
    }
    static Update() {
        const songList = this.playlistElement.querySelector(".song-list")
        songList.replaceWith(new SongList(this.songs, this.onPlaylistItemClick, this.catagory).CreateElement(true))
    }
    static Hide() {
        document.getElementById("playlist-view").style.display = "none"
        document.getElementById("content-tabs").style.display = "block"
    }
}

function OnPlaylistCloseButtonClick(event) {
    PlaylistView.Hide()
}
function LoadPlaylistItemToQueue(song, songs) {
    SongQueue.LoadSongs(songs)
    SongQueue.UpdateQueue()
    SongQueue.currentSong = song
    UpdateNowPlaying()
    Audio.Play(song)
}