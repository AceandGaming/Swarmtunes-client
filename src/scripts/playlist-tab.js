class PlaylistTab {
    static playlistTab = document.getElementById("playlists-tab")
    static playlists = []

    static ShowLoggedOutScreen() {
        const errorScreen = new LoginRequired()
        const element = errorScreen.CreateElement()
        this.playlistTab.append(element)
        for (let child of this.playlistTab.children) {
            child.classList.add("require-auth")
        }
    }
    static Populate() {
        const playlists = PlaylistManager.playlists
        const catagory = new PlaylistCatagory("", playlists, true)
        const element = catagory.CreateElement()
        element.setAttribute("id", "playlist-grid")

        const grid = document.getElementById("playlist-grid")
        grid.replaceWith(element)
    }
    static OnPlaylistLoaded() {
        this.Populate()
    }
}