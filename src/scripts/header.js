currentTheme = 0
function AttachButtons() {
    const header = document.getElementById("header-tabs")
    const tabs = header.children
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].addEventListener("click", OnTabClick)
        if (tabs[i].dataset.window === "discover") {
            tabs[i].style.backgroundColor = CssColours.GetColour("header-tab-active")
        }
    }
}
function ShowContentWindow(window) {
    const contentTabs = document.getElementById("content-tabs")
    for (let i = 0; i < contentTabs.children.length; i++) {
        contentTabs.children[i].style.display = "none"
    }
    window.style.display = "flex"
    PlaylistView.Hide()
}
function OnTabClick(event) {
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
    const tabs = document.getElementById("header-tabs").children
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].style = ""
    }
    tab.style.backgroundColor = CssColours.GetColour("header-tab-active")
}
function OnLoginButtonClick() {
    Login.Show()
}
function OnLogoutButtonClick() {
    Network.LogOut()
}
function OnChangeThemeClick() {
    currentTheme++
    if (currentTheme > 2) {
        currentTheme = 0
    }
    const img = document.querySelector("#change-theme-button img")
    switch (currentTheme) {
        case 0:
            img.src = "src/art/icons/moon.svg"
            document.documentElement.dataset.theme = "dark"
            break
        case 1:
            img.src = "src/art/icons/newero.avif"
            document.documentElement.dataset.theme = "neuro"
            break
        case 2:
            img.src = "src/art/icons/newliv.avif"
            document.documentElement.dataset.theme = "evil"
            break
    }
}