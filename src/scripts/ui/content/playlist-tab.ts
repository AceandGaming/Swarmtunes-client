import type { Playlist } from "@ts/models/playlist"
import { PlaylistCatagory, ResizeAllGridDisplays } from "@ts/ui/catagories"
import { LoginRequired } from "@ts/ui/error-screens"
import PlaylistStore from "@ts/playlist-store"

export default class PlaylistTab {
    static playlistTab: HTMLElement = document.getElementById("playlists-tab") as HTMLElement
    static playlists: Playlist[] = []

    static ShowLoggedOutScreen() {
        for (let child of this.playlistTab.children) {
            child.classList.add("require-auth")
        }
        const errorScreen = new LoginRequired()
        const element = errorScreen.CreateElement()
        this.playlistTab.append(element)
    }
    static async Populate() {
        const playlists = PlaylistStore.GetAll()

        const catagory = new PlaylistCatagory("", playlists, true)
        const element = catagory.CreateElement()
        element.setAttribute("id", "playlist-grid")

        const grid = document.getElementById("playlist-grid") as HTMLElement
        grid.replaceWith(element)

        ResizeAllGridDisplays()
    }
}