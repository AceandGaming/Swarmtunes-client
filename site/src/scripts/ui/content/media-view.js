class MediaView {
    _songList
    _coverArt
    _loadingArt
    _title
    _discription
    _actions

    _lastMediaId

    static OnItemClick(event) {
        SongQueue.LoadSongs(MediaView._songList.songs)
        SongQueue.UpdateQueue()
        SongQueue.currentSong = SongQueue.GetSong(event.target.dataset.uuid)
        UpdateNowPlaying()
        AudioPlayer.instance.Play(SongQueue.currentSong)
    }
    static Create() {
        const element = document.createElement("div")
        element.id = "media-view"

        const closeButton = document.createElement("button")
        closeButton.classList.add("close-button")
        closeButton.addEventListener("click", MediaView.Hide.bind(MediaView))

        const content = document.createElement("div")
        content.classList.add("content")

        const cover = document.createElement("img")
        cover.src = "src/assets/no-song.png"
        cover.classList.add("loading")

        const loadingCover = document.createElement("img")
        loadingCover.src = "src/assets/no-song.png"

        cover.onload = () => {
            cover.classList.remove("loading")
            loadingCover.style.display = "none"
        }

        const textContainer = document.createElement("div")
        textContainer.classList.add("text-container")
        const title = document.createElement("h1")
        title.textContent = "Title"
        const discription = document.createElement("h2")
        discription.classList.add("sub-text")

        const actions = document.createElement("div")
        actions.classList.add("actions")

        textContainer.append(title, discription)
        content.append(cover, loadingCover, textContainer, actions)

        MediaView._songList = new SongList([], MediaView.OnItemClick, "media-item")

        element.append(closeButton, content, MediaView._songList.element)

        MediaView._title = title
        MediaView._discription = discription
        MediaView._coverArt = cover
        MediaView._loadingArt = loadingCover
        MediaView._actions = actions
        MediaView.element = element

        document.getElementById("content").appendChild(element)
    }
    static _PopulateActions() {

    }
    static _UpdateContent(title, discription, coverUrl) {
        MediaView._title.textContent = title
        MediaView._discription.textContent = discription

        MediaView._coverArt.classList.add("loading")
        MediaView._loadingArt.style.display = "block"
        MediaView._coverArt.src = coverUrl
    }
    static _PopulateSongList(mediaObject, catagory = "song", onSongsLoaded = () => { }) {
        if (mediaObject.uuid == MediaView._lastMediaId) {
            LoadingText.Detach(MediaView.element)
            MediaView._songList.Show()
            return
        }
        MediaView._lastMediaId = mediaObject.uuid

        function Update(songs) {
            MediaView._songList.songs = songs
            MediaView._songList.Update()
            onSongsLoaded()
        }
        MediaView._songList.Hide()
        MediaView._songList.catagory = catagory
        if (mediaObject.songsLoaded) {
            Update(mediaObject.songs)
        } else {
            LoadingText.Attach(MediaView.element)
            mediaObject.GetSongs().then(() => {
                LoadingText.Detach(MediaView.element)
                Update(mediaObject.songs)
            })
        }
    }
    static Hide() {
        MediaView.element.style.display = "none"
        ShowContentTabs()
    }
    static Show(mediaObject) {
        MediaView.element.style.display = "flex"
        HideContentTabs()
    }
    static ShowLoading() {
        MediaView.element.style.display = "flex"
        HideContentTabs()
        MediaView._UpdateContent("Loading...", "", "src/assets/no-song.png",)
        MediaView._songList.Hide()
        LoadingText.Attach(MediaView.element)
    }
    static ClearMediaId(id) {
        if (MediaView._lastMediaId == id) {
            MediaView._lastMediaId = null
        }
    }
}

class AlbumView {
    static Show(album) {
        let title = album.Title
        if (album.songs.length === 1) {
            title = "Special Release"
        }
        MediaView._UpdateContent(title, album.PrettyDate, Network.GetCover(album.Cover, 512))
        MediaView._PopulateActions()
        MediaView.Show()
        function OnSongsLoaded() {
            MediaView._songList.SortByTitle()
        }
        MediaView._PopulateSongList(album, "song", OnSongsLoaded)
    }
}

class PlaylistView {
    static playlist
    static Show(playlist) {
        PlaylistView.playlist = playlist
        MediaView._UpdateContent(playlist.Title, "", Network.GetCover(playlist.Cover, 512))
        MediaView._PopulateActions()
        MediaView.Show()
        MediaView._PopulateSongList(playlist, "playlist-item")
    }
    static Update() {
        PlaylistView.Show(this.playlist)
    }
}