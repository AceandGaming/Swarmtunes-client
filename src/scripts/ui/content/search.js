import Network from "@ts/network"
import ErrorScreen from "@ts/ui/error-screens"
import { LoadingText } from "@ts/ui/loading"
import { SongList } from "@ts/ui/song-list"

let searchTimeout

export async function PopulateSearch(searchTerm, maxResults = 10) {
    function OnNetworkFailed() {
        const errorScreen = new ErrorScreen("Failed to get search results")
        const element = errorScreen.CreateElement()
        document.getElementById("search-results").innerHTML = ""
        document.getElementById("search-results").append(element)
    }
    LoadingText.Attach(document.getElementById("search-results"))
    const songs = await Network.Search(searchTerm, maxResults)

    const songlist = new SongList(songs)
    const element = songlist.CreateElement(true)
    element.id = "search-results"
    document.getElementById("search-results").replaceWith(element)
}
function OnSearchValueChange(event) {
    if (searchTimeout) {
        clearTimeout(searchTimeout)
    }
    searchTimeout = setTimeout(() => {
        PopulateSearch(event.target.value)
    }, 500)
}
function OnSearchChange(event) {
    if (searchTimeout) {
        clearTimeout(searchTimeout)
    }
    PopulateSearch(event.target.value, 50)
}

const bar = document.getElementById("search-bar")
bar.addEventListener("keydown", OnSearchValueChange)
bar.addEventListener("change", OnSearchChange)