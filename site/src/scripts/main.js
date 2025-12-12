let DEV_MODE = true
//@@release-only@@ DEV_MODE = false
document.cookie = "cookie=A cookie for Neuro-sama; max-age=260000; secure; samesite=lax; path=/"

if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register("./service-worker.js")
        .catch((err) => console.error(err))

    navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload()
    })
}

const colourThief = new ColorThief()
async function AsyncCrap() {
    await Network.CheckOnline()
    await SongDatabase.Initalise()
    await PlaylistDatabase.Initalise()
}


let isMobile = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

function OnLogin(isAdmin) {
    document.getElementById("header-login-button").textContent = "Log Out"
    document
        .getElementById("header-login-button")
        .setAttribute("onclick", "OnLogoutButtonClick()")
    PlaylistManager.GetPlaylists().then(PlaylistTab.Populate)

    const authElements = Array.from(
        document.getElementsByClassName("require-auth")
    )
    for (let element of authElements) {
        element.classList.remove("require-auth")
    }
    if (isAdmin) {
        const adminElements = Array.from(
            document.getElementsByClassName("require-admin")
        )
        for (let element of adminElements) {
            element.classList.remove("require-admin")
        }
    }
}
Login.AddLoginCallback(OnLogin)

function CreateUI() {
    if (isMobile) {
        CurrentSongBar.CreateMobile()
        CreateButton(true)
        localStorage.setItem("volume", 1)
    } else {
        CurrentSongBar.CreateDesktop()
        CreateButton()
    }
    PlaylistTab.ShowLoggedOutScreen()
    PopulateSearch("")
    ContextMenu.Initalise()

    MediaView.Create()
    SongFullscreen.Create()

    AttachButtons()
    Login.CreateWindow()
    new CreatePlaylistPopup()
    new RenamePlaylistPopup()
    PopulateDiscover().catch((e) => {
        const errorScreen = new LoadingError()
        discoverPage.append(errorScreen.CreateElement())
        console.error(e)
    })
    currentTheme = Number(localStorage.getItem("theme") ?? 0)

    ShowContentWindow(document.getElementById("discover"))
    UpdateTheme()
    ResizeAllGridDisplays()
    PlayState.Initalise()
}
function LoadUrlBar() {
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    const songId = urlParams.get("song")
    const playlistLink = urlParams.get("playlist")

    if (songId !== null) {
        SongRequester.GetSong(songId).then((song) => {
            SongQueue.LoadSingleSong(song)
            AudioPlayer.instance.Play(song)
        })
    }
    if (playlistLink !== null) {
        Login.AddLoginCallback(async () => {
            const playlist = await Network.AddSharedPlaylist(playlistLink)
            PlaylistManager.AddPlaylist(playlist)
            PlaylistTab.Populate()
        })
    }

    const cleanUrl =
        window.location.protocol +
        "//" +
        window.location.host +
        window.location.pathname
    window.history.replaceState({}, document.title, cleanUrl)
}
AsyncCrap().then(() => {
    CreateUI()
    LoadUrlBar()

    if (Network.IsLoggedIn()) {
        Login.CallLoginCallbacks()
    }
    else {
        Network.GetNewSession()
    }
})

function UpdateNavigatorTime(played, duration, loaded) {
    navigator.mediaSession.setPositionState({
        duration: duration,
        playbackRate: 1,
        position: played,
    })
}

AudioPlayer.instance.OnTimeUpdate(UpdateNavigatorTime)
SwarmFM.instance.OnTimeUpdate(UpdateNavigatorTime);