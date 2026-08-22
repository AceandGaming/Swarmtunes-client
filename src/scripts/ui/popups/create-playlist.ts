import { ReplaceEmotesOfString } from "@ts/emote"
import { ListenForInputSubmit } from "@ts/misc"
import { Playlist } from "@ts/models/playlist"
import PlaylistProvider from "@ts/playlist-provider"
import PopupWindow from "@ts/ui/popups/popup"
import ToastManager from "@ts/ui/toast-manager"

export function ValidatePlaylistName(name: string) {
    return {
        error: false,
        message: ""
    }
}
export class CreatePlaylistPopup extends PopupWindow {
    static instance: CreatePlaylistPopup
    input: HTMLInputElement
    error: HTMLParagraphElement
    playlist?: Playlist

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
        const cor = PlaylistProvider.CreatePlaylist(name)
        cor.catch((e) => { this.SetBusy(false); this.error.textContent = e.message })
        cor.then(() => {
            this.Hide()
            ToastManager.Toast(`Created playlist <b>${ReplaceEmotesOfString(name)}</b>`, "none", 3, true)
        })
    }
    Show() {
        super.Show()
        this.input.value = ""
        this.error.textContent = ""
    }
}