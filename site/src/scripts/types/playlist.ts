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
    }
    get Singers() { return this.singers }
    get Date() { return this.date }
    get SongIds() { return this.songIds }
    get IsLoaded() { return this.songsLoaded }

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
            this.songs = await SongRequester.GetSongs(this.songIds)
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
        MediaView.ClearMediaId(this.Id)
    }
    Has(song: id) {
        return this.songIds.includes(song)
    }
    AddMultiple(songs: Song[]) {
        for (const song of songs) {
            this.Add(song)
        }
    }
    AddIds(ids: id[]) {
        if (this.songsLoaded) {
            throw new Error("Playlist songs already loaded")
        }
        for (const id of ids) {
            if (this.songIds.includes(id)) {
                continue
            }
            this.songIds.push(id)
        }
    }
    Remove(song: Song) {
        if (!this.songsLoaded) {
            throw new Error("Playlist songs not loaded")
        }
        const index = this.songIds.indexOf(song.Id)
        this.songIds.splice(index, 1)
        this.songs.splice(index, 1)
        MediaView.ClearMediaId(this.Id)
    }
    RemoveIds(ids: id[]) {
        for (const id of ids) {
            this.RemoveAtId(id)
        }
    }
    RemoveAtId(id: id) {
        const index = this.songIds.indexOf(id)
        this.songIds.splice(index, 1)
        if (this.songsLoaded) {
            this.songs.splice(index, 1)
        }
        MediaView.ClearMediaId(this.Id)
    }

    ToJson() {
        return {
            id: this.id,
            title: this.title,
            singers: this.singers,
            date: this.date,
            coverType: this.coverType,
            songIds: this.songIds
        }
    }
}

function OnPlaylistClick(event: any) {
    const id = event.target.dataset.id
    PlaylistManager.DisplayPlaylist(id)
}


ContextMenu.AddCategory("playlist", [
    new ContextGroup("queue", false, false, [
        new ContextOption("Play Now", "src/assets/icons/play.svg", async (event) => {
            const playlist = await PlaylistManager.LoadPlaylist(event.id)
            SongQueue.PlayNow(playlist.Songs)
            // @ts-ignore
            PlaybackController.PlaySong(playlist.Songs[0])
        })
    ]),
    new ContextGroup("manage playlist", true, false, [
        new ContextOption("Rename", "src/assets/icons/edit.svg", (event) => {
            RenamePlaylistPopup.instance.Show(event.id)
        }),
        new ContextOption("Delete", "src/assets/icons/trash.svg", async (event) => {
            const confirmation = await ConfirmAction.AskUser("You are about to delete <strong>" + ReplaceEmotesOfString(PlaylistManager.GetPlaylist(event.id).title) + "</strong>")
            if (!confirmation) {
                return
            }
            PlaylistManager.RemovePlaylist(event.id)
            ToastManager.Toast("Playlist Deleted")
        })
    ]),
    new ContextGroup("playlists", true, false, [
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
            PlaylistRequester.AddSongToPlaylist(otherId, playlist.songIds)
            ToastManager.Toast(`Added ${playlist.songIds.length} songs to ${playlist.Title}`)
        }),
        new ContextOption("New Playlist", "src/assets/icons/plus.svg", (event) => {
            CreatePlaylistPopup.instance.Show()
        })
    ]),
    new ContextGroup("share", false, true, [
        new ContextOption("Share", "src/assets/icons/share.svg", async (event) => {
            const url = "https://share.swarmtunes.com/?p=" + (await Network.SharePlaylist(event.id))
            const corutine = navigator.clipboard.writeText(url)
            corutine.then(() => {
                ToastManager.Toast("Copied link to clipboard")
            })
            corutine.catch(() => {
                ToastManager.Toast("Failed to copy link to clipboard", "error")
            })
        }),
        new ContextOption("Export", "src/assets/icons/file-export.svg", (event) => {
            Network.GetPlaylistMP3s(event.id)
        })
    ])
])