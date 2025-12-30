interface AlbumPrams {
    id: id
    date: string
    singers: string[]
    songIds?: id[]
    coverType?: "neuro" | "evil" | "duet" | null
}

class Album {
    get Id() { return this.id }
    get Date() { return this.date }
    get Singers() { return this.singers }
    get SongIds() { return this.songIds }
    get CoverType() { return this.coverType }

    get Songs() {
        if (!this.songsLoaded) {
            console.warn("Album songs not loaded")
        }
        return this.songs
    }
    get PrettyDate() {
        return this.date.toLocaleDateString("en-AU", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    }
    get Title() {
        return this.singers.join(" and ") + " Karaoke"
    }
    get Cover() {
        if (this.songIds.length === 1) {
            if (this.songsLoaded) {
                return this.songs[0]?.Cover
            }
            return this.songIds[0]
        }
        return this.coverType
    }

    private readonly id: id
    private date: Date
    private singers: string[]
    private coverType: "neuro" | "evil" | "duet" | null
    private songIds: id[]
    private songs: Array<Song>;
    private songsLoaded: boolean;

    constructor(options: AlbumPrams) {
        this.id = options.id
        this.date = new Date(options.date)
        this.singers = options.singers
        this.coverType = options.coverType ?? null
        this.songIds = options.songIds ?? []
        this.songs = []
        this.songsLoaded = false
    }
    async GetSongs() {
        if (this.songsLoaded) {
            return this.songs
        }
        this.songs = await SongRequester.GetSongs(this.songIds)
        this.songs = this.songs.sort((a, b) => a.Title.localeCompare(b.Title))
        this.songsLoaded = true
        return this.songs
    }
}

function OnAlbumClick(event: any) {
    const id = event.target.dataset.id
    MediaView.ShowLoading()
    Network.GetAlbum(id).then(album => {
        if (!MediaView.IsVisible()) {
            return
        }
        AlbumView.Show(album)
    })
}




ContextMenu.AddCategory("album", [
    new ContextGroup("queue", false, false, [
        new ContextOption("Play Now", "src/assets/icons/play.svg", async (event) => {
            const album = await Network.GetAlbum(event.id, true)
            SongQueue.PlayNow(album.songs)
            // @ts-ignore
            PlaybackController.PlaySong(album.songs[0])
        }),
    ]),
    new ContextGroup("playlist", true, false, [
        new ContextOption("Add Songs To Playlist", "src/assets/icons/playlist-add.svg", async (event) => {
            const playlistid = await SelectPlaylist.AskUser()
            if (playlistid === null) {
                return
            }
            const playlist = PlaylistManager.GetPlaylist(playlistid)
            await playlist.GetSongs()
            const album = await Network.GetAlbum(event.id, true)
            playlist.AddMultiple(album.songs)
            PlaylistRequester.AddSongToPlaylist(playlistid, album.songIds)
        }),
    ]),
    new ContextGroup("share", false, true, [
        // new ContextOption("Share", "src/assets/icons/share.svg", async (event) => {
        //     const url = "https://share.swarmtunes.com/?a=" + (await Network.ShareAlbum(event.id))
        //     navigator.clipboard.writeText(url)
        // }),
        new ContextOption("Export", "src/assets/icons/file-export.svg", (event) => {
            Network.GetAlbumMP3s(event.id)
        }),
    ])
])