import { Search } from "@ts/api/song"
import { LoadingText } from "@ts/ui/loading"
import { SongList } from "@ts/ui/song-list"

let searchTimeout: number | null

export async function PopulateSearch(searchTerm: string, maxResults = 10) {
    const resultsEl = document.getElementById("search-results")
    if (!resultsEl) {
        return
    }

    LoadingText.Attach(resultsEl)
    const songs = await Search(searchTerm, maxResults)

    const songlist = new SongList(songs)
    const element = songlist.CreateElement(true)
    element.id = "search-results"
    resultsEl.replaceWith(element)
}
function OnSearchValueChange(event: any) {
    if (searchTimeout) {
        clearTimeout(searchTimeout)
    }
    searchTimeout = setTimeout(() => {
        PopulateSearch(event.target.value)
    }, 500)
}
function OnSearchChange(event: any) {
    if (searchTimeout) {
        clearTimeout(searchTimeout)
    }
    PopulateSearch(event.target.value, 50)
}

const bar = document.getElementById("search-bar")
bar?.addEventListener("keydown", OnSearchValueChange)
bar?.addEventListener("change", OnSearchChange)