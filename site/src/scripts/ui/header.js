let currentTheme = 0

function CreateButton(footer = false) {
    const container = document.createElement("div");
    container.id = "tabs-container";
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
    `;
    if (footer) {
        document.querySelector("footer").append(container);
    } else {
        document.querySelector("header").prepend(container);
    }
}


function AttachButtons() {
    const header = document.getElementById("tabs-container");
    const tabs = header.children;
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].addEventListener("click", OnTabClick);
        if (tabs[i].dataset.window === "discover") {
            tabs[i].classList.add("selected");
        }
    }
}
function ShowContentWindow(window) {
    const contentTabs = document.getElementById("content-tabs");
    contentTabs.style.display = "block";
    for (let i = 0; i < contentTabs.children.length; i++) {
        contentTabs.children[i].style.display = "none";
    }
    window.style.display = "flex";
    MediaView.Hide();
}
function HideContentTabs(window) {
    document.getElementById("content-tabs").style.display = "none";
}
function ShowContentTabs() {
    document.getElementById("content-tabs").style.display = "block";
}
function OnTabClick(event) {
    const tab = event.target;
    const windowId = tab.dataset.window;
    if (windowId === undefined) {
        return;
    }
    const window = document.getElementById(windowId);
    if (window === undefined) {
        return;
    }
    ShowContentWindow(window);
    const tabs = document.getElementById("tabs-container").children;
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove("selected");
    }
    tab.classList.add("selected");
    ResizeAllGridDisplays()
}
function OnLoginButtonClick() {
    Login.Show();
}
function OnLogoutButtonClick() {
    Network.LogOut();
}
function UpdateTheme() {
    const img = document.querySelector("#change-theme-button img");
    switch (currentTheme) {
        case 0:
            img.src = "src/assets/icons/moon.svg";
            document.documentElement.dataset.theme = "dark";
            break;
        case 1:
            img.src = "src/assets/icons/newero.avif";
            document.documentElement.dataset.theme = "neuro"
            break;
        case 2:
            img.src = "src/assets/icons/newliv.avif";
            document.documentElement.dataset.theme = "evil";
            break;
    }
    const root = document.documentElement;
    const styles = getComputedStyle(root);
    const colour = styles.getPropertyValue(`--header-colour`).trim();
    const meta = document.querySelector('meta[name="theme-color"]');
    meta.setAttribute("content", colour);

}
function OnChangeThemeClick() {
    currentTheme++;
    if (currentTheme > 2) {
        currentTheme = 0;
    }
    UpdateTheme();
    localStorage.setItem("theme", currentTheme);
}

function HideFooter() {
    document.querySelector("footer").style.display = "none";
}
function ShowFooter() {
    document.querySelector("footer").style.display = "flex";
}