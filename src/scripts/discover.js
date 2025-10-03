const discoverPage = document.querySelector("#discover")

function AddCategoryToDiscover(catagory) {
    discoverPage.appendChild(catagory.CreateElement())
}

async function PopulateDiscover() {
    LoadingText.Attach(discoverPage)
    let albums, orginalSongs = []
    let atempts = 0
    while (true) {
        try {
            albums = await Network.GetAllAlbums()
            orginalSongs = await Network.GetAllSongs({filters: ["original=true"]})
            break
        }
        catch (e) {
            atempts++
            if (atempts > 3) {
                console.error("Failed to get discover after 5 atempts", e)
                const errorScreen = new ErrorScreen("Failed to load content", PopulateDiscover)
                LoadingText.Detach(discoverPage)
                discoverPage.append(errorScreen.CreateElement())
                return
            }
        }
        await new Promise(r => setTimeout(r, 2000))
    }
    albums.sort((a, b) => b.jsDate - a.jsDate)
    orginalSongs.sort((a, b) => b.jsDate - a.jsDate)

    AddCategoryToDiscover(new AlbumCatagory("Recent Streams", albums))
    AddCategoryToDiscover(new SongCatagory("Original Songs", orginalSongs))

    LoadingText.Detach(discoverPage)
}

function OnSwarmFMButtonClick() {
    SongQueue.LoadSingleSong(SwarmFM.song)
    SwarmFM.Play()
}