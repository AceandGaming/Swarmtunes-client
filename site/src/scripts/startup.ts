//@ts-ignore
const colourThief = new ColorThief()

let isNewSession = !sessionStorage.getItem('visited')
sessionStorage.setItem('visited', 'true');

let isMobile = window.matchMedia("(pointer: coarse)").matches;
let isTablet = isMobile && (Math.min(window.screen.width, window.screen.height) >= 768)


function CreateUI() {
    const main = document.querySelector("main")
    if (!main) {
        throw Error("If you see this error. Shits gone bad")
    }
    const nav = document.createElement("nav")

    const header = document.createElement("header")
    const TabMenu = document.createElement("swarmtunes-tab-view") as TabView
    TabMenu.TabsContainer = header
    TabMenu.AddPanel(document.createElement("swarmtunes-discover-menu") as DiscoverMenu)

    nav.append(header, TabMenu)

    const songbar = document.createElement("swarmtunes-current-song-bar")
    main.append(nav, songbar)
}

CreateUI()
document.getElementById("loading-screen").classList.add("hide")