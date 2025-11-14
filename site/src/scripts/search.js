
function PopulateSearch(searchTerm) {
    function NetworkReturnPromise(songs) {
        const songlist = new SongList(songs)
        const element = songlist.CreateElement(true)
        element.id = "search-results"
        document.getElementById("search-results").replaceWith(element)
    }
    function OnNetworkFailed() {
        const errorScreen = new ErrorScreen("Failed to get search results")
        const element = errorScreen.CreateElement()
        element.id = "search-results"
        document.getElementById("search-results").replaceWith(element)
    }
    LoadingText.Attach(document.getElementById("search-results"))
    async = Network.Search(searchTerm)
    async.catch(OnNetworkFailed)
    async.then(NetworkReturnPromise)
}
function OnSearchValueChange(event) {
    PopulateSearch(event.target.value)
}