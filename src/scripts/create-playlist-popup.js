function ValidatePlaylistName(name) {
    name = name.trim()
    if (name.length > 32 || name.length <= 0) {
        return {
            error: true,
            message: "Invalid playlist name"
        }
    }
    if (!/^[0-9A-Za-z_ ]+$/.test(name)) {
        return {
            error: true,
            message: "Name contains invalid characters"
        }
    }
    return {
        error: false,
        message: ""
    }
}
class CreatePlaylistPopup {
    static AttachInputs() {
        this.background = document.getElementById("create-playlist-background")
        this.error = document.getElementById("create-playlist-error")

        this.input = document.getElementById("playlist-name-input")
        this.input.addEventListener("input", this.#OnInput.bind(this))

        this.boarderColour = CssColours.GetColour("popup-input-boarder")
        this.errorColour = CssColours.GetColour("popup-input-boarder-error")

        const loginButton = document.getElementById("create-playlist-button")
        loginButton.addEventListener("click", this.#OnButtonClick.bind(this))

        const closeButton = document.getElementById("create-playlist-close-button")
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
        const cor = Network.CreatePlaylist(name)
        cor.catch(() => this.error.textContent = "An unknown error occurred")
        cor.then(response => {
            if (response.error) {
                this.error.textContent = response.error
                return
            }
            PlaylistManager.AddPlaylist(response)
            PlaylistTab.Populate()
            this.Hide()
        })
    }
    static Show() {
        if (!Network.IsLoggedIn()) {
            return
        }
        this.background.style.display = "flex"
        this.input.value = ""
        this.error.textContent = ""
    }
    static Hide() {
        this.background.style.display = "none"
    }
}

OnCreatePlaylistButtonClick = () => {
    CreatePlaylistPopup.Show()
}