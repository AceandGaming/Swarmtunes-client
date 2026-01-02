interface SongPrams {
    id: id,
    title: string,
    artist: string,
    singers: string[],
    coverType: "neuro" | "evil" | "duet" | "custom",
    date?: string,
    isOriginal?: boolean,
    coverArt?: string | null,
    youtubeId?: string | null
}

class Song {
    public static CreateOfflineSong(id: id) {
        return new Song({
            id,
            title: "Unavailable",
            artist: "offline",
            singers: ["Offline"],
            coverType: "duet",
        })
    }


    get Id() { return this.id }
    get Title() { return this.title }
    get Artist() { return this.artist }
    get Singers() { return this.singers }
    get CoverType() { return this.coverType }
    get Date() { return this.date }
    get IsOriginal() { return this.isOriginal }
    get YoutubeId() { return this.youtubeId }

    get HasCustomCover() {
        return this.coverType == "custom"
    }
    get PrettyDate() {
        return this.date.toLocaleDateString("en-AU", {
            day: "numeric",
            month: "short",
            year: "numeric",
        })
    }
    get Cover(): string {
        if (this.HasCustomCover) {
            if (this.coverArt == null) {
                console.error("Song has custom cover but no cover art", `Type: ${this.coverType}, Art: ${this.coverArt}`)
            }
            // @ts-ignore
            return this.coverArt
        }
        return this.coverType
    }

    private readonly id: id
    private title: string
    private artist: string
    private singers: string[]
    private coverType: "neuro" | "evil" | "duet" | "custom"
    private date: Date
    private isOriginal: boolean
    private readonly coverArt: string | null
    private youtubeId: string | null

    constructor(options: SongPrams) {
        this.id = options.id
        this.title = options.title
        this.artist = options.artist
        this.singers = options.singers
        this.coverType = options.coverType
        this.date = options.date ? new Date(options.date) : new Date()
        this.isOriginal = options.isOriginal ?? false
        this.coverArt = options.coverArt ?? null
        if (options.title === "mashup" && options.date) {
            this.title = `Mashup ${this.date.getFullYear()}`
        }
        this.youtubeId = options.youtubeId ?? null
    }

    ToString() {
        return `${this.title} by ${this.artist}`
    }
    ToJson() {
        return {
            id: this.id,
            title: this.title,
            artist: this.artist,
            singers: this.singers,
            coverType: this.coverType,
            date: this.date.toISOString(),
            isOriginal: this.isOriginal,
            coverArt: this.coverArt,
            youtubeId: this.youtubeId
        }
    }
    Copy() {
        return new Song(this.ToJson())
    }
}

function OnSongClick(event: any) {
    const id = event.target.dataset.id
    AudioPlayer.instance.Clear()
    SongRequester.GetSong(id).then((song) => {
        if (song === undefined) {
            console.warn("Song clicked with no song")
            return
        }
        // @ts-ignore
        PlaybackController.PlaySong(song)
        SongQueue.LoadSingleSong(song)
    })
}


ContextMenu.AddCategory("song", [
    new ContextGroup("queue", false, false, [
        new ContextOption("Append to Queue", "src/assets/icons/plus.svg", async (event) => {
            const song = await SongRequester.GetSong(event.id)
            SongQueue.AppendSong(song)
        }),
    ]),
    new ContextGroup("playlist", true, false, [
        new ContextOption("Add to Playlist", "src/assets/icons/playlist-add.svg", async (event) => {
            const playlistid = await SelectPlaylist.AskUser()
            if (playlistid === null) {
                return
            }
            const song = await SongRequester.GetSong(event.id)
            const playlist = PlaylistManager.GetPlaylist(playlistid)
            if (playlist.Has(event.id)) {
                ToastManager.Toast("Song already in playlist", "error")
                return
            }
            await playlist.GetSongs()
            playlist.Add(song)
            PlaylistRequester.AddSongToPlaylist(playlistid, [event.id])
            PlaylistView.Update()
            ToastManager.Toast(`Added song to ${playlist.Title}`)
        })
    ]),
    new ContextGroup("share", false, true, [
        new ContextOption("Share", "src/assets/icons/share.svg", async (event) => {
            const url = "https://share.swarmtunes.com/?s=" + (await Network.ShareSong(event.id))
            const corutine = navigator.clipboard.writeText(url)
            corutine.then(() => {
                ToastManager.Toast("Copied link to clipboard")
            })
            corutine.catch(() => {
                ToastManager.Toast("Failed to copy link to clipboard", "error")
            })
        }),
        new ContextOption("Export", "src/assets/icons/file-export.svg", (event) => {
            Network.DownloadSong(event.id, true)
        }),
    ])
])