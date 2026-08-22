import { Search } from "@ts/api/song"
import { LoadingText } from "@ts/ui/loading"
import SongList from "@ts/ui/item-list.svelte"
import { mount } from "svelte"

let searchTimeout: number | null

export async function PopulateSearch(searchTerm: string, maxResults = 10) {
    const resultsEl = document.getElementById("search-results")
    if (!resultsEl) {
        return
    }

    LoadingText.Attach(resultsEl)
    const songs = await Search(searchTerm, maxResults)

    resultsEl.innerHTML = ""
    mount(SongList, { target: resultsEl, props: { items: songs } })

    LoadingText.Detach(resultsEl)
}
function OnSearchValueChange(event: any) {
    if (searchTimeout) {
        clearTimeout(searchTimeout)
    }
    searchTimeout = setTimeout(() => {
        PopulateSearch(event.target.value)
    }, 200)
}
function OnSearchChange(event: any) {
    if (searchTimeout) {
        clearTimeout(searchTimeout)
    }
    PopulateSearch(event.target.value, 50)
}

const bar = document.getElementById("search-bar") as HTMLInputElement
bar.value = ""
bar.addEventListener("keydown", OnSearchValueChange)
bar.addEventListener("change", OnSearchChange)