class MediaView {
    _songList
    _coverArt
    _loadingArt
    _title
    _discription
    _actions

    _lastMediaId

    static OnItemClick(event) {
        if (MediaView._songList.songs.length === 0) {
            return
        }
        SongQueue.LoadSongs(MediaView._songList.songs)
        const song = SongQueue.GetSong(event.target.dataset.id)
        SongQueue.UpdateQueue(song)
        NowPlaying.sourceId = MediaView._lastMediaId
        PlaybackController.PlaySong(SongQueue.currentSong)
    }
    static OnCoverClick(event) {
        SongQueue.LoadSongs(MediaView._songList.songs)
        SongQueue.PassiveUpdate()
        SongQueue.currentSong = SongQueue.firstSong
        NowPlaying.Update()
        NowPlaying.sourceId = MediaView._lastMediaId
        PlaybackController.PlaySong(SongQueue.currentSong)
    }
    static Create() {
        const element = document.createElement("div")
        element.id = "media-view"

        const closeButton = document.createElement("button")
        closeButton.append(LoadSVG("src/assets/icons/x.svg"))
        closeButton.classList.add("close-button", "icon-button")
        closeButton.addEventListener("click", MediaView.Hide.bind(MediaView))

        const content = document.createElement("div")
        content.classList.add("content")

        const coverContainer = document.createElement("div")
        coverContainer.classList.add("cover-container")
        coverContainer.addEventListener("click", MediaView.OnCoverClick)

        const cover = document.createElement("img")
        cover.src = "src/assets/no-song.png"
        cover.classList.add("loading")

        const loadingCover = document.createElement("img")
        loadingCover.src = "src/assets/no-song.png"

        cover.onload = () => {
            cover.classList.remove("loading")
            loadingCover.style.display = "none"
        }

        const playIcon = document.createElement("div")
        playIcon.appendChild(LoadSVG("src/assets/icons/play.svg"))
        playIcon.classList.add("play")

        coverContainer.append(cover, loadingCover, playIcon)

        const textContainer = document.createElement("div")
        textContainer.classList.add("text-container")
        const title = document.createElement("h1")
        title.textContent = "Title"
        const discription = document.createElement("h2")
        discription.classList.add("sub-text")

        const actions = document.createElement("div")
        actions.classList.add("actions")

        textContainer.append(title, discription)
        content.append(coverContainer, textContainer, actions)

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
        MediaView._title.innerHTML = ReplaceEmotesOfString(title)
        MediaView._discription.textContent = discription
        MediaView._coverArt.classList.add("loading")
        MediaView._loadingArt.style.display = "block"
        MediaView._coverArt.src = coverUrl
    }
    static async _PopulateSongList(mediaObject, catagory = "song", onSongsLoaded = () => { }) {
        if (mediaObject.id == MediaView._lastMediaId) {
            MediaView._songList.Show()
            return
        }
        MediaView._lastMediaId = mediaObject.id
        MediaView.element.setAttribute("data-id", mediaObject.id)

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
            if (MediaView._lastMediaId != mediaObject.id) {
                return
            }
            LoadingText.Attach(MediaView.element)
            await mediaObject.GetSongs()
            LoadingText.Detach(MediaView.element)
            if (MediaView._lastMediaId != mediaObject.id) {
                return
            }
            Update(mediaObject.songs)
        }
    }
    static Hide() {
        MediaView.element.style.display = "none"
        ShowContentTabs()
    }
    static Show() {
        MediaView.element.style.display = "flex"
        HideContentTabs()
    }
    static IsVisible() {
        return MediaView.element.style.display == "flex"
    }
    static ShowLoading() {
        MediaView.element.style.display = "flex"
        HideContentTabs()
        MediaView._UpdateContent("Loading...", "", "src/assets/no-song.png",)
        MediaView._songList.Hide()
        MediaView._songList.songs = []
    }
    static ClearMediaId(id) {
        if (MediaView._lastMediaId == id) {
            MediaView._lastMediaId = null
        }
    }
}

class AlbumView {
    static async Show(album) {
        let title = album.Title
        if (album.songs.length === 1) {
            title = "Special Release"
        }
        MediaView._UpdateContent(title, album.PrettyDate, Network.GetCover(album.Cover, 512))
        MediaView._PopulateActions()
        MediaView.Show()

        await MediaView._PopulateSongList(album, "song")
    }
}

class PlaylistView {
    static playlist
    static async Show(playlist) {
        PlaylistView.playlist = playlist
        MediaView._UpdateContent(playlist.Title, "", Network.GetCover(playlist.Cover, 512))
        MediaView._PopulateActions()
        MediaView.Show()

        await MediaView._PopulateSongList(playlist, "playlist-item")
    }
    static Update() {
        if (!MediaView.IsVisible()) {
            return
        }
        PlaylistView.Show(this.playlist)
    }
}

ContextMenu.InheritCategory("playlist-item", "song", [
    new ContextGroup("playlist", true, false, [
        new ContextOption("Remove From Playlist", "src/assets/icons/playlist-remove.svg", async (event) => {
            const playlistid = PlaylistView.playlist.Id
            if (playlistid === undefined) {
                return
            }
            const playlist = PlaylistManager.GetPlaylist(playlistid)
            playlist.RemoveAtId(event.id)
            PlaylistRequester.RemoveSongFromPlaylist(playlistid, [event.id])
            PlaylistView.Update()
            ToastManager.Toast(`Removed song from '${playlist.Title}'`)
        })
    ])
])