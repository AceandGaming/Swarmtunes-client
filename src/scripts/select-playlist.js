function CreatePlaylistListItemElement(playlist, onClickEvent) {
    const element = document.createElement("li")
    element.setAttribute("data-uuid", playlist.uuid)
    element.addEventListener("click", onClickEvent)
    element.innerHTML = `
        <img loading="lazy" src=${Network.GetCoverUrl(playlist.cover, 64)}>
        <span>${playlist.name}</span>
    `
    return element
}
class SelectPlaylist {
    static AskUser() {
        return new Promise((resolve, reject) => {
            document.getElementById("select-playlist-close-button").addEventListener("click", () => {
                this.Hide()
                resolve(null)
            })
            function OnPlaylistClick(event) {
                const uuid = event.target.dataset.uuid
                this.Hide()
                if (uuid) {
                    resolve(uuid)
                }
                else {
                    reject()
                }
            }
            this.#LoadPlaylists(OnPlaylistClick.bind(this))
        })
    }
    static #LoadPlaylists(onClickEvent) {
        const playlists = PlaylistManager.playlists
        const list = document.createElement("ol")

        for (const playlist of playlists) {
            list.appendChild(CreatePlaylistListItemElement(playlist, onClickEvent))
        }

        document.querySelector("#select-playlist > ol").replaceWith(list)

        this.Show()
    }
    static Show() {
        document.getElementById("select-playlist-background").style.display = "flex"
    }
    static Hide() {
        document.getElementById("select-playlist-background").style.display = "none"
    }
}