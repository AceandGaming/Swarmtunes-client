interface MediaItem {
    Id: id
    Title: string
    CoverUrl: string
    Date: Date
}
interface SongsMedia extends MediaItem {
    SongIds: id[]
    GetSongs(): Promise<Song[]>
}