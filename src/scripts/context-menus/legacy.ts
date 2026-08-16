import ContextMenu from "@ts/context-menu.svelte"
import { CreateSongContextMenu } from "@ts/context-menus/song"
import { CreateCollectionContextMenu } from "@ts/context-menus/collection"
import { CreatePlaylistContextMenu } from "@ts/context-menus/playlist"
import SongProvider from "@ts/song-provider"
import { GetCollection } from "@ts/api/collection"
import PlaylistProvider from "@ts/playlist-provider"
import { MediaView } from "@ts/ui/content/media-view"
import { Playlist } from "@ts/models/playlist"
import { ContextMenuGroup } from "@ts/context-menu.svelte"
import { IconPlaylistX } from "@tabler/icons-svelte-runes"

export async function ShowContextMenu(id: id, catagory: string, x: number, y: number) {
    let options
    let song
    switch (catagory) {
        case "song":
            song = await SongProvider.Get(id)
            if (song) {
                options = CreateSongContextMenu(song)
            }
            break
        case "album":
            const album = await GetCollection(id)
            if (album) {
                options = CreateCollectionContextMenu(album)
            }
            break
        case "playlist":
            const playlist = await PlaylistProvider.Get(id)
            if (playlist) {
                options = CreatePlaylistContextMenu(playlist)
            }
            break
        case "playlist-item":
            song = await SongProvider.Get(id)
            if (song) {
                options = CreateSongContextMenu(song)
                options.push({
                    label: "Remove From Playlist",
                    icon: IconPlaylistX,
                    group: ContextMenuGroup.Playlist,
                    Action: async () => {
                        const playlist = MediaView.media
                        if (!(playlist instanceof Playlist)) {
                            return
                        }

                        await PlaylistProvider.RemoveSongsFromPlaylist(playlist.id, [id])
                        MediaView.Update(playlist)
                    }
                })
            }
            break
    }

    if (options) {
        ContextMenu.Show({ options, x, y })
    }
}
