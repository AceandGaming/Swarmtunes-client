import Network from "@ts/network"
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
    container.innerHTML = `
        <button class="tab" data-window="playlists-tab">
            <span>Playlists</span>
            <img src="src/assets/icons/layout-grid.svg">
        </button>
        <button class="tab" data-window="discover">
            <span>Discover</span>
            <img src="src/assets/icons/web.svg">
        </button>
        <button class="tab" data-window="search">
            <span>Search</span>
            <img src="src/assets/icons/search.svg">
        </button>
        <button class="tab require-admin" data-window="admin-panel">
            <span>Admin</span>
            <img src="src/assets/icons/tool.svg">
        </button>
    `
    if (footer) {
        document.querySelector("footer").append(container)
    } else {
        document.querySelector("header").prepend(container)
    }
    AttachButtons()
}


export function AttachButtons() {
    const header = document.getElementById("tabs-container")
    const tabs = header.children
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].addEventListener("click", OnTabClick)
        if (tabs[i].dataset.window === "discover") {
            tabs[i].classList.add("selected")
        }
    }
}
export function ShowContentWindow(window) {
    const contentTabs = document.getElementById("content-tabs")
    contentTabs.style.display = "block"
    for (let i = 0; i < contentTabs.children.length; i++) {
        contentTabs.children[i].style.display = "none"
    }
    window.style.display = "flex"
    MediaView.Hide()
}
export function HideContentTabs(window) {
    document.getElementById("content-tabs").style.display = "none"
}
export function ShowContentTabs() {
    document.getElementById("content-tabs").style.display = "block"
}
export function OnTabClick(event) {
    const tab = event.target
    const windowId = tab.dataset.window
    if (windowId === undefined) {
        return
    }
    const window = document.getElementById(windowId)
    if (window === undefined) {
        return
    }
    ShowContentWindow(window)
    const tabs = document.getElementById("tabs-container").children
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove("selected")
    }
    tab.classList.add("selected")
    ResizeAllGridDisplays()
}

export function OnLoginButtonClick() {
    Login.Show()
}
export function OnLogoutButtonClick() {
    Network.LogOut()
}
document.getElementById("header-login-button").addEventListener("click", OnLoginButtonClick)

export function UpdateThemeColor(colour) {
    if (!colour) {
        const root = document.documentElement
        const styles = getComputedStyle(root)
        colour = styles.getPropertyValue(`--header-colour`).trim()
    }
    const meta = document.querySelector('meta[name="theme-color"]')
    meta.setAttribute("content", colour)
}
export function UpdateTheme() {
    const img = document.querySelector("#change-theme-button img")
    switch (currentTheme) {
        case 0:
            img.src = "src/assets/icons/moon.svg"
            document.documentElement.dataset.theme = "dark"
            break
        case 1:
            img.src = "src/assets/icons/newero.avif"
            document.documentElement.dataset.theme = "neuro"
            break
        case 2:
            img.src = "src/assets/icons/newliv.avif"
            document.documentElement.dataset.theme = "evil"
            break
    }
    UpdateThemeColor()
}
export function OnChangeThemeClick() {
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

export function HideFooter() {
    document.querySelector("footer").style.display = "none"
}
export function ShowFooter() {
    document.querySelector("footer").style.display = "flex"
}