import { SongsMedia } from "./media-items";
import Network from "@ts/network/network"
import { PrettyDate } from "@ts/utils";

interface AlbumPrams {
    id: id
    date: string
    singers: string[]
    songIds?: id[]
    cover: string
}

export class Album implements SongsMedia {
    get Id() { return this.id }
    get Date() { return this.date }
    get Singers() { return this.singers }
    get SongIds() { return this.songIds }
    get Cover() { return this.cover }

    get Songs() {
        if (!this.songsLoaded) {
            console.error("Album songs not loaded", this)
        }
        return this.songs
    }
    get PrettyDate() {
        return PrettyDate(this.date)
    }
    get Title() {
        return this.singers.join(" and ") + " Karaoke"
    }
    get CoverUrl() {
        return this.Cover ? Network.GetCover(this.Cover) : "src/assets/no-song.png"
    }

    private readonly id: id
    private date: Date
    private singers: string[]
    private cover: string
    private songIds: id[]
    private songs: Array<Song>;
    private songsLoaded: boolean;

    constructor(options: AlbumPrams) {
        this.id = options.id
        this.date = new Date(options.date)
        this.singers = options.singers
        this.cover = options.cover ?? null
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

// function OnAlbumClick(event: any) {
//     const id = event.target.dataset.id
//     MediaView.ShowLoading()
//     Network.GetAlbum(id).then(album => {
//         if (!MediaView.IsVisible()) {
//             return
//         }
//         AlbumView.Show(album)
//     })
// }




// ContextMenu.AddCategory("album", [
//     new ContextGroup("queue", false, false, [
//         new ContextOption("Play Now", "src/assets/icons/play.svg", async (event) => {
//             const album = await Network.GetAlbum(event.id, true)
//             SongQueue.PlayNow(album.songs)
//             // @ts-ignore
//             PlaybackController.PlaySong(album.songs[0])
//         }),
//     ]),
//     new ContextGroup("playlist", true, false, [
//         new ContextOption("Add Songs To Playlist", "src/assets/icons/playlist-add.svg", async (event) => {
//             const playlistid = await SelectPlaylist.AskUser()
//             if (playlistid === null) {
//                 return
//             }
//             const playlist = PlaylistManager.GetPlaylist(playlistid)
//             await playlist.GetSongs()
//             const album = await Network.GetAlbum(event.id, true)
//             playlist.AddMultiple(album.songs)
//             PlaylistRequester.AddSongToPlaylist(playlistid, album.songIds)
//             ToastManager.Toast(`Added ${album.songIds.length} songs to <b>${ReplaceEmotesOfString(playlist.Title)}</b>`, "none", 3, true)
//         }),
//     ]),
//     new ContextGroup("share", false, true, [
//         // new ContextOption("Share", "src/assets/icons/share.svg", async (event) => {
//         //     const url = "https://share.swarmtunes.com/?a=" + (await Network.ShareAlbum(event.id))
//         //     navigator.clipboard.writeText(url)
//         // }),
//         new ContextOption("Export", "src/assets/icons/file-export.svg", (event) => {
//             Network.GetAlbumMP3s(event.id)
//         }),
//     ])
// ])