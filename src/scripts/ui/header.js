import { LoadSVG } from "@ts/misc"
import { ResizeAllGridDisplays } from "@ts/ui/catagories"
import { MediaView } from "@ts/ui/content/media-view"
import { Login } from "@ts/ui/popups/login"

let currentTheme = Number(localStorage.getItem("theme") ?? 0)

export function CreateButton(footer = false) {
    const old = document.querySelector("#tabs-container")
    if (old) {
        old.remove()
    }

    const container = document.createElement("div")
    container.id = "tabs-container"

    function AddTab(id, name, img) {
        const button = document.createElement("button")
        button.classList.add("tab")
        button.dataset.window = id

        const span = document.createElement("span")
        span.textContent = name
        button.append(span)

        const svg = LoadSVG(img)
        button.append(svg)

        button.addEventListener("click", OnTabClick)
        container.append(button)
    }

    AddTab("playlists-tab", "Playlists", "/icons/layout-grid.svg")
    AddTab("discover", "Discover", "/icons/web.svg")
    AddTab("search", "Search", "/icons/search.svg")

    if (footer) {
        document.querySelector("footer").append(container)
    } else {
        document.querySelector("header").prepend(container)
    }
    AttachButtons()
}


function AttachButtons() {
    const header = document.getElementById("tabs-container")
    const tabs = header.children
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].addEventListener("click", OnTabClick)
        if (tabs[i].dataset.window === "discover") {
            tabs[i].classList.add("selected")
        }
    }
}
export function ShowContentWindow(contentWindow) {
    const contentTabs = document.getElementById("content-tabs")

    contentTabs.style.display = "block"
    for (let i = 0; i < contentTabs.children.length; i++) {
        contentTabs.children[i].style.display = "none"
    }

    contentWindow.style.display = "flex"
    MediaView.Hide()
}
export function HideContentTabs(window) {
    document.getElementById("content-tabs").style.display = "none"
}
export function ShowContentTabs() {
    document.getElementById("content-tabs").style.display = "block"
}
function OnTabClick(event) {
    const tab = event.target
    const windowId = tab.dataset.window
    if (windowId === undefined) {
        throw new Error("No window id found")
    }
    const window = document.getElementById(windowId)
    if (window === undefined) {
        throw new Error("No window found")
    }
    ShowContentWindow(window)
    const tabs = document.getElementById("tabs-container").children
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove("selected")
    }
    tab.classList.add("selected")
    ResizeAllGridDisplays()
}

function OnLoginButtonClick() {
    Login.Show()
}

document.getElementById("header-login-button").onclick = OnLoginButtonClick

export function UpdateTheme() {
    const img = document.querySelector("#change-theme-button img")
    switch (currentTheme) {
        case 0:
            img.src = "/icons/moon.svg"
            document.documentElement.dataset.theme = "dark"
            break
        case 1:
            img.src = "/icons/newero.avif"
            document.documentElement.dataset.theme = "neuro"
            break
        case 2:
            img.src = "/icons/newliv.avif"
            document.documentElement.dataset.theme = "evil"
            break
    }
}
function OnChangeThemeClick() {
    currentTheme++
    if (currentTheme > 2) {
        currentTheme = 0
    }
    UpdateTheme()
    try {
        localStorage.setItem("theme", currentTheme)
    }
    catch (e) {
        console.error("Failed to save theme", e)
    }
}
document.getElementById("change-theme-button").addEventListener("click", OnChangeThemeClick)