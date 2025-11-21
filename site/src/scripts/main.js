let DEV_MODE = true
//@@release-only@@ DEV_MODE = false
document.cookie = "cookie=A cookie for Neuro-sama; max-age=260000; secure; samesite=lax; path=/";

const colourThief = new ColorThief();

PlaylistTab.ShowLoggedOutScreen();
PopulateSearch("");
if (window.innerWidth <= 500) {
    CurrentSongBar.CreateMobile();
    CreateButton(true);
    localStorage.setItem("volume", 1)
} else {
    CurrentSongBar.CreateDesktop();
    CreateButton();
}
MediaView.Create()

AttachButtons();
Login.CreateWindow();
new CreatePlaylistPopup();
new RenamePlaylistPopup();
PopulateDiscover().catch((e) => {
    const errorScreen = new LoadingError()
    discoverPage.append(errorScreen.CreateElement())
    console.error(e)
})
currentTheme = Number(localStorage.getItem("theme") ?? 0);
UpdateTheme();

ShowContentWindow(document.getElementById("discover"));

ResizeAllGridDisplays()

function OnLogin(isAdmin) {
    document.getElementById("header-login-button").textContent = "Log Out";
    document
        .getElementById("header-login-button")
        .setAttribute("onclick", "OnLogoutButtonClick()");
    PlaylistManager.GetPlaylists().then(PlaylistTab.Populate);

    const authElements = Array.from(
        document.getElementsByClassName("require-auth")
    );
    for (let element of authElements) {
        element.classList.remove("require-auth");
    }
    if (isAdmin) {
        const adminElements = Array.from(
            document.getElementsByClassName("require-admin")
        );
        for (let element of adminElements) {
            element.classList.remove("require-admin");
        }
    }
}
Login.AddLoginCallback(OnLogin);

if (Network.IsLoggedIn()) {
    Login.CallLoginCallbacks();
}

function LoadUrlBar() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const songId = urlParams.get("song");

    if (songId !== null) {
        Network.GetSong(songId).then((song) => {
            SongQueue.LoadSingleSong(song);
            AudioPlayer.instance.Play(song);
        });
    }

    const cleanUrl =
        window.location.protocol +
        "//" +
        window.location.host +
        window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
}
LoadUrlBar();

if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register("/service-worker.js")
        .catch((err) => console.error(err));
}
