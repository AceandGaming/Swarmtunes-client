export interface MediaItem {
    Id: id
    Title: string
    CoverUrl: string
    Date: Date
    Type: string
}
export interface SongsMedia extends MediaItem {
    SongIds: id[]
    GetSongs(): Promise<Song[]>
}