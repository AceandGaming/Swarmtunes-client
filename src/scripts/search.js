
function PopulateSearch(searchTerm) {
    function NetworkReturnPromise(songs) {
        const songlist = new SongList(songs)
        if (searchTerm !== "") {
            songlist.SortByTitleDifference(searchTerm)
        }
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
    const async = Network.GetAllSongs({filters: [`title*=${searchTerm}`], maxResults: 20})
    async.catch(OnNetworkFailed)
    async.then(NetworkReturnPromise)
}
function OnSearchValueChange(event) {
    PopulateSearch(event.target.value)
}
PopulateSearch("")