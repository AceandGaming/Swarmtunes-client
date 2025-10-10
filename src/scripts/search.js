
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
    let async
    if (searchTerm) {
        async = Network.Search(searchTerm)
    }
    else {
        async = Network.GetAllSongs({maxResults: 30})
    }
    async.catch(OnNetworkFailed)
    async.then(NetworkReturnPromise)
}
function OnSearchValueChange(event) {
    PopulateSearch(event.target.value)
}