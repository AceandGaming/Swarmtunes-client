//TODO: Replace with proper system

class RenamePlaylistPopup {
    static AttachInputs() {
        this.background = document.getElementById("rename-playlist-background")
        this.error = document.getElementById("rename-playlist-error")

        this.input = document.getElementById("replaylist-name-input")
        this.input.addEventListener("input", this.#OnInput.bind(this))

        this.boarderColour = CssColours.GetColour("popup-input-boarder")
        this.errorColour = CssColours.GetColour("popup-input-boarder-error")

        const loginButton = document.getElementById("rename-playlist-button")
        loginButton.addEventListener("click", this.#OnButtonClick.bind(this))

        const closeButton = document.getElementById("rename-playlist-close-button")
        closeButton.addEventListener("click", this.Hide.bind(this))
    }
    static #OnInput() {
        const name = this.input.value
        const result = ValidatePlaylistName(name)
        if (result.error) {
            this.error.textContent = result.message
            this.input.style.borderColor = this.errorColour
        }
        else {
            this.error.textContent = ""
            this.input.style.borderColor = this.boarderColour
        }
    }
    static #OnButtonClick() {
        const name = this.input.value
        if (ValidatePlaylistName(name).error) {
            return
        }
        this.Hide()
        this.playlist.name = name
        PlaylistTab.Populate()
    }
    static Show(uuid) {
        if (!Network.IsLoggedIn()) {
            return
        }
        const playlist = PlaylistManager.GetPlaylist(uuid)

        this.background.style.display = "flex"
        this.input.value = playlist.name
        this.error.textContent = ""

        this.playlist = playlist
    }
    static Hide() {
        this.background.style.display = "none"
    }
}