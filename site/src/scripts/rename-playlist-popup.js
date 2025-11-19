class RenamePlaylistPopup extends PopupWindow {
    static instance

    constructor() {
        super("Rename playlist")
        this.input = document.createElement("input")
        this.input.type = "text"
        this.input.placeholder = "Playlist Name"
        this.content.appendChild(this.input)

        this.error = document.createElement("p")
        this.error.style.color = "red"
        this.error.style.fontSize = "12px"
        this.content.appendChild(this.error)

        this.input.addEventListener("input", this.#OnInput.bind(this))
        this.CreateButton("Rename", this.#OnButtonClick.bind(this), false)

        RenamePlaylistPopup.instance = this
    }
    #OnInput() {
        const name = this.input.value
        const result = ValidatePlaylistName(name)
        if (result.error) {
            this.error.textContent = result.message
            this.input.classList.add("error")
        }
        else {
            this.error.textContent = ""
            this.input.classList.remove("error")
        }
    }
    #OnButtonClick() {
        const name = this.input.value
        if (ValidatePlaylistName(name).error) {
            return
        }
        this.Hide()
        this.playlist.Title = name
        PlaylistTab.Populate()
    }
    Show(uuid) {
        if (!Network.IsLoggedIn()) {
            return
        }
        const playlist = PlaylistManager.GetPlaylist(uuid)

        this.background.style.display = "flex"
        this.input.value = playlist.title
        this.error.textContent = ""

        this.playlist = playlist
    }
}