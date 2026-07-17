import { ReplaceEmotesOfString } from "@ts/emote"
import { ListenForInputSubmit } from "@ts/misc"
import Network from "@ts/network"
import PlaylistManager from "@ts/playlist-manager"
import PlaylistTab from "@ts/ui/content/playlist-tab"
import PopupWindow from "@ts/ui/popups/popup"
import ToastManager from "@ts/ui/toast-manager"

function ValidatePlaylistName(name) {
    name = name.trim()
    if (name.length > 32 || name.length <= 0) {
        return {
            error: true,
            message: "Invalid playlist length"
        }
    }
    if (!/^[0-9A-Za-z_ :]+$/.test(name)) {
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
export class CreatePlaylistPopup extends PopupWindow {
    static instance

    constructor() {
        super("Create a playlist")
        this.input = document.createElement("input")
        this.input.type = "text"
        this.input.placeholder = "Playlist Name"
        this.content.appendChild(this.input)
        ListenForInputSubmit(this.input, this.#OnButtonClick.bind(this))

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
        cor.catch(() => { this.SetBusy(false); this.error.textContent = "An unknown error occurred" })
        cor.then(response => {
            if (response.error) {
                this.error.textContent = response.error
                this.SetBusy(false)
                return
            }
            PlaylistManager.AddPlaylist(response)
            PlaylistTab.Populate()
            this.Hide()
            ToastManager.Toast(`Created playlist <b>${ReplaceEmotesOfString(name)}</b>`, "none", 3, true)
        })
    }
    Show() {
        if (!Network.IsLoggedIn() || !Network.IsOnline()) {
            return
        }
        super.Show()
        this.input.value = ""
        this.error.textContent = ""
    }
}

function OnCreatePlaylistButtonClick() {
    CreatePlaylistPopup.instance.Show()
}
document.getElementById("new-playlist-button").addEventListener("click", OnCreatePlaylistButtonClick)