import { GetPlaylist } from "@ts/api/playlist"
import { Playlist } from "@ts/models/playlist"
import PlaylistStore from "@ts/playlist-store.svelte.ts"
import { AddSongsToPlaylist, RemoveSongsFromPlaylist, RenamePlaylist, DeletePlaylist, CreatePlaylist } from "@ts/api/playlist"

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