import { ReplaceEmotesOfString } from "@ts/emote"
import { ListenForInputSubmit } from "@ts/misc"
import Network from "@ts/network"
import PlaylistManager from "@ts/playlist-manager"
import { PlaylistRequester } from "@ts/playlist-requester"
import type { Playlist } from "@ts/types/playlist"
import PlaylistTab from "@ts/ui/content/playlist-tab"
import { ValidatePlaylistName } from "@ts/ui/popups/create-playlist"
import PopupWindow from "@ts/ui/popups/popup"
import ToastManager from "@ts/ui/toast-manager"

export class RenamePlaylistPopup extends PopupWindow {
    static instance: RenamePlaylistPopup
    input: HTMLInputElement
    error: HTMLParagraphElement
    playlist?: Playlist

    constructor() {
        super("Rename playlist")
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
        if (!this.playlist) {
            return
        }

        const name = this.input.value
        const oldName = this.playlist.Title
        if (ValidatePlaylistName(name).error) {
            return
        }
        this.Hide()
        this.playlist.Title = name
        PlaylistRequester.RenamePlaylist(this.playlist.Id, name)
        PlaylistTab.Populate()
        ToastManager.Toast(`Renamed <b>${ReplaceEmotesOfString(oldName)}</b> to <b>${ReplaceEmotesOfString(name)}</b>`, "none", 3, true)
    }
    // @ts-ignore
    Show(id: id) {
        if (!Network.IsLoggedIn()) {
            return
        }
        const playlist = PlaylistManager.GetPlaylist(id)
        if (!playlist) {
            throw new Error("Playlist not found")
        }

        super.Show()
        this.input.value = playlist.Title
        this.error.textContent = ""

        this.playlist = playlist
    }
}