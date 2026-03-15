import '@css/main.scss';
import '@ts/ui/components/selectors/tab-bar';
import '@ts/ui/panels/main/discover';
import '@ts/ui/panels/main/media-view';
import '@ts/ui/panels/panel-view';
import '@ts/ui/panels/current-song-bar';

function CreateUI() {
    const main = document.createElement("main")
    main.id = "app"
    const nav = document.createElement("nav")

    const header = document.createElement("st-tab-bar")
    const TabMenu = document.createElement("st-panel-view")
    TabMenu.Selector = header
    TabMenu.AddPanel(document.createElement("st-discover-menu"))
    const mediaView = document.createElement("st-media-view")
    TabMenu.AddPanel(mediaView)

    window.tempMediaView = () => {
        TabMenu.SelectPanel(1)
        return mediaView
    }

    nav.append(header, TabMenu)

    const songbar = document.createElement("st-current-song-bar")
    main.append(nav, songbar)

    document.body.append(main)
}

CreateUI()
//@ts-ignore
document.getElementById("loading-screen").style.opacity = "0"