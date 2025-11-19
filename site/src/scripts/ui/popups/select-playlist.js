function CreatePlaylistListItemElement(playlist, onClickEvent) {
    const element = document.createElement("li")
    element.setAttribute("data-uuid", playlist.Id)
    element.addEventListener("click", onClickEvent)
    element.innerHTML = `
        <img loading="lazy" src=${Network.GetCover(playlist.Cover, 64)}>
        <span>${playlist.Title}</span>
    `
    return element
}
class SelectPlaylist extends PopupWindow {
    static instance
    static AskUser() {
        return new Promise((resolve, reject) => {
            function OnPlaylistClick(event) {
                const uuid = event.target.dataset.uuid
                SelectPlaylist.instance.Hide()
                if (uuid) {
                    resolve(uuid)
                }
                else {
                    reject()
                }
            }
            new SelectPlaylist(OnPlaylistClick)
            this.instance.window.querySelector(".close-button").addEventListener("click", () => {
                this.instance.Hide()
                resolve(null)
            })
            this.instance.Show()
        })
    }
    constructor(onClickEvent) {
        super("Select a playlist")
        const playlists = PlaylistManager.playlists
        const list = document.createElement("ol")
        list.id = "select-playlist"

        for (const playlist of playlists) {
            list.appendChild(CreatePlaylistListItemElement(playlist, onClickEvent))
        }

        this.content.appendChild(list)

        SelectPlaylist.instance = this
    }
}