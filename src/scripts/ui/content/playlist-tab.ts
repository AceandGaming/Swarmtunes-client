import type { Playlist } from "@ts/models/playlist"
import ItemCards from "@ts/ui/item-cards.svelte"
import { LoginRequired } from "@ts/ui/error-screens"
import PlaylistStore from "@ts/playlist-store"
import { mount } from "svelte"

export default class PlaylistTab {
    static playlistTab: HTMLElement = document.getElementById("playlists-tab") as HTMLElement
    static playlists: Playlist[] = []

    static ShowLoggedOutScreen() {
        for (let child of this.playlistTab.children) {
            child.classList.add("require-auth")
        }
        const errorScreen = new LoginRequired()
        const element = errorScreen.CreateElement()
        this.playlistTab.append(element)
    }
    static async Populate() {
        const playlists = PlaylistStore.GetAll()

        document.querySelector("#playlists-tab .item-cards")?.remove()
        const catagory = mount(ItemCards, { target: this.playlistTab, props: { items: playlists, grid: true } })


    }
}