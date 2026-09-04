import { Playlist } from "@ts/models/playlist"
import PlaylistStore from "@ts/playlist-store.svelte.ts"
import { GetPlaylist, AddSongsToPlaylist, RemoveSongsFromPlaylist, RenamePlaylist, DeletePlaylist, CreatePlaylist, GetPlaylists } from "@ts/api/playlist"

export default class PlaylistProvider {
    public static async Get(id: id): Promise<Playlist> {
        let playlist = PlaylistStore.Get(id)
        if (playlist) {
            return playlist
        }

        playlist = await GetPlaylist(id)
        PlaylistStore.Set(id, playlist)
        return playlist
    }
    public static async GetMany(ids: id[]): Promise<Playlist[]> {
        const playlists = PlaylistStore.GetMany(ids)
        const storedIds = playlists.map(playlist => playlist.id)

        const missing = ids.filter(id => !storedIds.includes(id))
        if (missing.length == 0) {
            return playlists
        }

        const newPlaylists = await GetPlaylists(missing)
        for (const playlist of newPlaylists) {
            PlaylistStore.Set(playlist.id, playlist)
        }

        return [...playlists, ...newPlaylists]
    }
    public static async GetAll() {
        return PlaylistStore.GetAll()
    }

    public static async AddSongsToPlaylist(playlistId: id, songIds: id[]) {
        await AddSongsToPlaylist(playlistId, songIds)
        await PlaylistStore.AddSongsToPlaylist(playlistId, songIds)
    }

    public static async RemoveSongsFromPlaylist(playlistId: id, songIds: id[]) {
        await RemoveSongsFromPlaylist(playlistId, songIds)
        await PlaylistStore.RemoveSongsToPlaylist(playlistId, songIds)
    }
    public static async RenamePlaylist(playlistId: id, title: string) {
        const newPlaylist = await RenamePlaylist(playlistId, title)
        PlaylistStore.Set(playlistId, newPlaylist)
        return newPlaylist
    }

    public static async DeletePlaylist(playlistId: id) {
        await DeletePlaylist(playlistId)
        PlaylistStore.Delete(playlistId)
    }
    public static async CreatePlaylist(title: string, songIds?: id[]) {
        const playlist = await CreatePlaylist(title, songIds)
        PlaylistStore.Set(playlist.id, playlist)
        return playlist
    }
}