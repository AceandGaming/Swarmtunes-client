
let searching = false
async function PopulateSearch(searchTerm) {
    function OnNetworkFailed() {
        const errorScreen = new ErrorScreen("Failed to get search results")
        const element = errorScreen.CreateElement()
        document.getElementById("search-results").innerHTML = ""
        document.getElementById("search-results").append(element)
    }
    LoadingText.Attach(document.getElementById("search-results"))
    searching = true
    let songs
    try {
        songs = await Network.Search(searchTerm)
    } catch (error) {
        OnNetworkFailed()
        return
    }
    finally {
        searching = false
    }

    const songlist = new SongList(songs)
    const element = songlist.CreateElement(true)
    element.id = "search-results"
    document.getElementById("search-results").replaceWith(element)
}
function OnSearchValueChange(event) {
    if (searching) {
        return
    }
    PopulateSearch(event.target.value)
}