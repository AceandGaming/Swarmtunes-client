import { AlbumCatagory, Catagory, SongCatagory } from "@ts/ui/catagories"
import { LoadingError } from "@ts/ui/error-screens"
import { LoadingText } from "@ts/ui/loading"
import PlaybackController from "@ts/playback"
import { GetDiscoverPage } from "@ts/api/pages"

const discoverPage = document.querySelector("#discover") as HTMLElement

function AddCategoryToDiscover(catagory: Catagory) {
    discoverPage.appendChild(catagory.CreateElement())
}

export async function PopulateDiscover() {
    LoadingText.Attach(discoverPage)
    let data = await GetDiscoverPage()

    const setlists = data.setlists.toSorted((a, b) => b.date!.getTime() - a.date!.getTime())
    const discs = data.discs.toSorted((a, b) => b.disc! - a.disc!)
    const orginals = data.originals.toSorted((a, b) => b.dateReleased.getTime() - a.dateReleased.getTime())
    const mashups = data.mashups.toSorted((a, b) => b.dateReleased.getTime() - a.dateReleased.getTime())

    AddCategoryToDiscover(new AlbumCatagory("Setlists", setlists))
    AddCategoryToDiscover(new SongCatagory("Originals", orginals))
    AddCategoryToDiscover(new SongCatagory("Mashups", mashups))
    AddCategoryToDiscover(new AlbumCatagory("Discs", discs))

    LoadingText.Detach(discoverPage)
}
export function ShowErrorScreen() {
    const errorScreen = new LoadingError()
    discoverPage.append(errorScreen.CreateElement())
}

function OnSwarmFMButtonClick() {
    PlaybackController.Play({ swarmfm: true })
}
document.getElementById("swarmfm-button")?.addEventListener("click", OnSwarmFMButtonClick)