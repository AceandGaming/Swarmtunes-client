import PlaylistManager from "@ts/playlist-manager"
import { PlaylistCatagory, ResizeAllGridDisplays } from "@ts/ui/catagories"
import { LoginRequired } from "@ts/ui/error-screens"

export default class PlaylistTab {
    static playlistTab = document.getElementById("playlists-tab")
    static playlists = []

    static ShowLoggedOutScreen() {
        for (let child of this.playlistTab.children) {
            child.classList.add("require-auth")
        }
        const errorScreen = new LoginRequired()
        const element = errorScreen.CreateElement()
        this.playlistTab.append(element)
    }
    static Populate() {
        const playlists = PlaylistManager.playlists
        if (playlists.length == 0) {
            return
        }
        const catagory = new PlaylistCatagory("", playlists, true)
        const element = catagory.CreateElement()
        element.setAttribute("id", "playlist-grid")

        const grid = document.getElementById("playlist-grid")
        grid.replaceWith(element)

        ResizeAllGridDisplays()
    }
    static OnPlaylistLoaded() {
        this.Populate()
    }
}