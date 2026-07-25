import Network from "@ts/network"
import { AlbumCatagory, Catagory, SongCatagory } from "@ts/ui/catagories"
import ErrorScreen, { LoadingError } from "@ts/ui/error-screens"
import { LoadingText } from "@ts/ui/loading"
import ToastManager from "@ts/ui/toast-manager"

const discoverPage = document.querySelector("#discover") as HTMLElement

function AddCategoryToDiscover(catagory: Catagory) {
    discoverPage.appendChild(catagory.CreateElement())
}

export async function PopulateDiscover() {
    LoadingText.Attach(discoverPage)
    let albums, orginalSongs, mashupSongs = []
    let atempts = 0
    while (true) {
        try {
            const values = await Promise.all([
                Network.GetAllAlbums(),
                Network.GetAllSongs({ filters: ["original=true"] }),
                Network.GetAllSongs({ filters: ["title=mashup"] })
            ])
            albums = values[0]
            orginalSongs = values[1]
            mashupSongs = values[2]
            break
        }
        catch (e) {
            atempts++
            if (atempts > 3) {
                console.error("Failed to get discover after 5 atempts", e)
                const errorScreen = new ErrorScreen("Failed to load content", PopulateDiscover)
                LoadingText.Detach(discoverPage)
                discoverPage.append(errorScreen.CreateElement())
                ToastManager.Toast("Failed to load discover content", "error", 5)
                return
            }
        }
        await new Promise(r => setTimeout(r, 2000))
    }
    albums.sort((a, b) => b.Date.getTime() - a.Date.getTime())
    orginalSongs.sort((a, b) => b.Date.getTime() - a.Date.getTime())
    mashupSongs.sort((a, b) => b.Date.getTime() - a.Date.getTime())

    AddCategoryToDiscover(new AlbumCatagory("Setlists", albums))
    AddCategoryToDiscover(new SongCatagory("Originals", orginalSongs))
    AddCategoryToDiscover(new SongCatagory("Mashups", mashupSongs))

    LoadingText.Detach(discoverPage)
}
export function ShowErrorScreen() {
    const errorScreen = new LoadingError()
    discoverPage.append(errorScreen.CreateElement())
}

// function OnSwarmFMButtonClick() {
//     SwarmFM.instance.Play()
// }
// document.getElementById("swarmfm-button")?.addEventListener("click", OnSwarmFMButtonClick)