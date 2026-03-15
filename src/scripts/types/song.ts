import { MediaItem } from "./media-items"
import Network from "@ts/network/network"

interface SongPrams {
    id: id,
    title: string,
    artists: string[],
    singers: string[],
    date?: string,
    isOriginal?: boolean,
    cover?: string | null,
    youtubeId?: string | null
}

export class Song implements MediaItem {
    public static CreateOfflineSong(id: id) {
        return new Song({
            id,
            title: "Unavailable",
            artists: ["offline"],
            singers: ["Offline"],
        })
    }


    get Id() { return this.id }
    get Title() { return this.title }
    get Artist() { return this.artists.join(", ") }
    get Singers() { return this.singers }
    get Date() { return this.date }
    get IsOriginal() { return this.isOriginal }
    get YoutubeId() { return this.youtubeId }
    get CoverArt() { return this.coverArt }

    get PrettyDate() {
        return this.date.toLocaleDateString("en-AU", {
            day: "numeric",
            month: "short",
            year: "numeric",
        })
    }
    get CoverUrl(): string {
        return this.coverArt ? Network.GetCover(this.coverArt) : "src/assets/no-song.png"
    }

    private readonly id: id
    private title: string
    private artists: string[]
    private singers: string[]
    private date: Date
    private isOriginal: boolean
    private readonly coverArt: string | null
    private youtubeId: string | null

    constructor(options: SongPrams) {
        this.id = options.id
        this.title = options.title
        this.artists = options.artists
        this.singers = options.singers
        this.date = options.date ? new Date(options.date) : new Date()
        this.isOriginal = options.isOriginal ?? false
        this.coverArt = options.cover ?? null
        if (options.title === "mashup" && options.date) {
            this.title = `${this.date.getFullYear()} Mashup`
        }
        this.youtubeId = options.youtubeId ?? null
    }

    ToString() {
        return `${this.title} by ${this.Artist}`
    }
    ToJson() {
        return {
            id: this.id,
            title: this.title,
            artists: this.artists,
            singers: this.singers,
            date: this.date.toISOString(),
            isOriginal: this.isOriginal,
            cover: this.coverArt,
            youtubeId: this.youtubeId
        }
    }
    Copy() {
        return new Song(this.ToJson())
    }
}

export function CopySongs(songs: Song[]) {
    const newSongs = []
    for (const song of songs) {
        newSongs.push(song.Copy())
    }
    return newSongs
}

// function OnSongClick(event: any) {
//     const id = event.target.dataset.id
//     AudioPlayer.instance.PrepForSong()
//     NowPlaying.sourceId = ""
//     SongRequester.GetSong(id).then((song) => {
//         if (song === undefined) {
//             console.warn("Song clicked with no song")
//             return
//         }
//         PlaybackController.PlaySong(song)
//         SongQueue.LoadSingleSong(song)
//     })
// }


// ContextMenu.AddCategory("song", [
//     new ContextGroup("queue", false, false, [
//         new ContextOption("Append to Queue", "src/assets/icons/plus.svg", async (event) => {
//             const song = await SongRequester.GetSong(event.id)
//             SongQueue.AppendSong(song)
//         }),
//     ]),
//     new ContextGroup("playlist", true, false, [
//         new ContextOption("Add to Playlist", "src/assets/icons/playlist-add.svg", async (event) => {
//             const playlistid = await SelectPlaylist.AskUser()
//             if (playlistid === null) {
//                 return
//             }
//             const song = await SongRequester.GetSong(event.id)
//             const playlist = PlaylistManager.GetPlaylist(playlistid)
//             if (playlist.Has(event.id)) {
//                 ToastManager.Toast("Song already in playlist", "error")
//                 return
//             }
//             await playlist.GetSongs()
//             playlist.Add(song)
//             PlaylistRequester.AddSongToPlaylist(playlistid, [event.id])
//             PlaylistView.Update()
//             ToastManager.Toast(`Added song to <b>${ReplaceEmotesOfString(playlist.Title)}</b>`, "none", 3, true)
//         })
//     ]),
//     new ContextGroup("share", false, true, [
//         new ContextOption("Share", "src/assets/icons/share.svg", async (event) => {
//             const url = "https://share.swarmtunes.com/?s=" + (await Network.ShareSong(event.id))
//             const corutine = navigator.clipboard.writeText(url)
//             corutine.then(() => {
//                 ToastManager.Toast("Copied link to clipboard")
//             })
//             corutine.catch(() => {
//                 const window = new ShareWindow(url)
//                 window.Show()
//             })
//         }),
//         new ContextOption("Export", "src/assets/icons/file-export.svg", (event) => {
//             Network.DownloadSong(event.id, true)
//         }),
//     ])
// ])