interface PlaylistPrams {
    id: id
    title: string
    singers: String[]
    date: string
    coverType?: "neuro" | "evil" | "duet" | null
    songIds?: id[]
}

class Playlist {
    get Id() { return this.id }
    get Title() { return this.title }
    set Title(title) {
        this.title = title
        Network.RenamePlaylist(this.id, title);
    }
    get Singers() { return this.singers }
    get Date() { return this.date }
    get SongIds() { return this.songIds }

    get Songs() {
        if (!this.songsLoaded) {
            console.warn("Playlist songs not loaded")
        }
        return this.songs
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
    private title: string
    private singers: String[]
    private date: Date
    private coverType: "neuro" | "evil" | "duet" | null
    private songIds: id[]
    private songs: Song[]
    private songsLoaded

    constructor(options: PlaylistPrams) {
        this.id = options.id
        this.title = options.title
        this.singers = options.singers
        this.date = new Date(options.date)
        this.coverType = options.coverType ?? null
        this.songIds = options.songIds ?? []
        this.songs = []
        this.songsLoaded = false
    }
    async GetSongs() {
        if (this.songsLoaded) {
            return this.songs
        }
        if (this.songIds.length > 0) {
            // @ts-ignore
            this.songs = await Network.GetSong(this.songIds)
        }
        this.songsLoaded = true
        return this.songs
    }
    Add(song: Song) {
        if (!this.songsLoaded) {
            throw new Error("Playlist songs not loaded")
        }
        if (this.songIds.includes(song.Id)) {
            return
        }
        this.songIds.push(song.Id)
        this.songs.push(song)
        Network.AddSongToPlaylist(this.id, [song.Id])
        MediaView.ClearMediaId(this.Id)
    }
    AddMultiple(songs: Song[]) {
        for (const song of songs) {
            this.Add(song)
        }
    }
    Remove(song: Song) {
        if (!this.songsLoaded) {
            throw new Error("Playlist songs not loaded")
        }
        const index = this.songIds.indexOf(song.Id)
        this.songIds.splice(index, 1)
        this.songs.splice(index, 1)
        Network.RemoveSongFromPlaylist(this.id, [song.Id])
        MediaView.ClearMediaId(this.Id)
    }
    RemoveAtId(id: id) {
        const index = this.songIds.indexOf(id)
        this.songIds.splice(index, 1)
        if (this.songsLoaded) {
            this.songs.splice(index, 1)
        }
        Network.RemoveSongFromPlaylist(this.id, [id])
        MediaView.ClearMediaId(this.Id)
    }
}

function OnPlaylistClick(event: any) {
    const id = event.target.dataset.id
    PlaylistManager.DisplayPlaylist(id)
}


ContextMenu.AddCategory("playlist", [
    new ContextGroup("queue", false, [
        new ContextOption("Play Now", "src/assets/icons/play.svg", async (event) => {
            const playlist = await Network.GetPlaylist(event.id)
            SongQueue.PlayNow(playlist.Songs)
            // @ts-ignore
            AudioPlayer.instance.Play(playlist.Songs[0])
        })
    ]),
    new ContextGroup("manage playlist", true, [
        new ContextOption("Rename", "src/assets/icons/edit.svg", (event) => {
            RenamePlaylistPopup.instance.Show(event.id)
        }),
        new ContextOption("Delete", "src/assets/icons/trash.svg", async (event) => {
            const confirmation = await ConfirmAction.AskUser("You are about to delete <strong>" + PlaylistManager.GetPlaylist(event.id).title + "</strong>")
            if (!confirmation) {
                return
            }
            PlaylistManager.RemovePlaylist(event.id)
        })
    ]),
    new ContextGroup("playlists", true, [
        new ContextOption("Add to Other Playlist", "src/assets/icons/playlist-add.svg", async (event) => {
            const id = event.id
            const otherId = await SelectPlaylist.AskUser()
            if (otherId === null) {
                return
            }
            if (id === otherId) {
                return
            }
            const playlist = await PlaylistManager.LoadPlaylist(id)
            const otherPlaylist = await PlaylistManager.LoadPlaylist(otherId)
            otherPlaylist.AddMultiple(playlist.songs)
        }),
        new ContextOption("New Playlist", "src/assets/icons/plus.svg", (event) => {
            CreatePlaylistPopup.instance.Show()
        })
    ]),
    new ContextGroup("share", false, [
        // new ContextOption("Share", "src/assets/icons/share.svg", async (event) => {
        //     const url = "https://share.swarmtunes.com/?p=" + (await Network.SharePlaylist(event.id))
        //     navigator.clipboard.writeText(url)
        // }),
        new ContextOption("Export", "src/assets/icons/file-export.svg", (event) => {
            Network.GetPlaylistMP3s(event.id)
        })
    ])
])