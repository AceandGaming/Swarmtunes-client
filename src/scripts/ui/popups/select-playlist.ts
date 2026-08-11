import { ReplaceEmotesOfString } from "@ts/emote"
import type { Playlist } from "@ts/models/playlist"
import PopupWindow from "@ts/ui/popups/popup"
import PlaylistStore from "@ts/playlist-store"

function CreatePlaylistListItemElement(playlist: Playlist, onClickEvent: (event: any) => void) {
    const element = document.createElement("li")
    element.setAttribute("data-id", playlist.id)
    element.addEventListener("click", onClickEvent)
    element.innerHTML = `
        <img loading="lazy" src=${playlist.GetArtwork("small")}>
        <span>${ReplaceEmotesOfString(playlist.title)}</span>
    `
    return element
}
export default class SelectPlaylist extends PopupWindow {
    static instance: SelectPlaylist

    static AskUser(): Promise<id | null> {
        const oldInstance = this.instance
        if (oldInstance) {
            document.body.removeChild(oldInstance.background)
        }
        return new Promise((resolve, reject) => {
            function OnPlaylistClick(event: any) {
                const id = event.target.dataset.id
                SelectPlaylist.instance.Hide()
                if (id) {
                    resolve(id)
                }
                else {
                    reject()
                }
            }
            new SelectPlaylist(OnPlaylistClick)
            this.instance.window.querySelector(".close-button")?.addEventListener("click", () => {
                this.instance.Hide()
                resolve(null)
            })
            this.instance.Show()
        })
    }
    constructor(onClickEvent: (event: any) => void) {
        super("Select a playlist")
        const playlists = PlaylistStore.GetAll()
        const list = document.createElement("ol")
        list.id = "select-playlist"

        for (const playlist of playlists) {
            list.appendChild(CreatePlaylistListItemElement(playlist, onClickEvent))
        }

        this.content.appendChild(list)

        SelectPlaylist.instance = this
    }
}