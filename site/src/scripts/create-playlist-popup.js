function ValidatePlaylistName(name) {
    name = name.trim()
    if (name.length > 32 || name.length <= 0) {
        return {
            error: true,
            message: "Invalid playlist length"
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
class CreatePlaylistPopup extends PopupWindow {
    static instance

    constructor() {
        super("Create a playlist")
        this.input = document.createElement("input")
        this.input.type = "text"
        this.input.placeholder = "Playlist Name"
        this.content.appendChild(this.input)

        this.error = document.createElement("p")
        this.error.style.color = "red"
        this.error.style.fontSize = "12px"
        this.content.appendChild(this.error)

        this.input.addEventListener("input", this.#OnInput.bind(this))
        this.CreateButton("Create", this.#OnButtonClick.bind(this), false)

        CreatePlaylistPopup.instance = this
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
    Show() {
        if (!Network.IsLoggedIn()) {
            return
        }
        this.background.style.display = "flex"
        this.input.value = ""
        this.error.textContent = ""
    }
}

function OnCreatePlaylistButtonClick() {
    CreatePlaylistPopup.instance.Show()
}