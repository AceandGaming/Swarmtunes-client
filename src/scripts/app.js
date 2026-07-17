import AudioPlayer from "@ts/audio"
import Network from "@ts/network"
import PlayState from "@ts/play-state"
import { PlaybackController } from "@ts/playback"
import PlaylistDatabase from "@ts/playlist-db"
import PlaylistManager from "@ts/playlist-manager"
import SongDatabase from "@ts/song-db"
import SongQueue from "@ts/song-queue"
import SongRequester from "@ts/song-requester"
import SwarmFM from "@ts/swarmfm"
import { ResizeAllGridDisplays } from "@ts/ui/catagories"
import { PopulateDiscover, ShowErrorScreen } from "@ts/ui/content/discover"
import { MediaView } from "@ts/ui/content/media-view"
import PlaylistTab from "@ts/ui/content/playlist-tab"
import { PopulateSearch } from "@ts/ui/content/search"
import SongFullscreen from "@ts/ui/content/song-fullscreen"
import { ContextMenu } from "@ts/ui/context-menu"
import "@ts/context-menus"
import CurrentSongBar from "@ts/ui/controls/current-song-bar"
import { LoadingError } from "@ts/ui/error-screens"
import { CreateButton, ShowContentWindow, UpdateTheme } from "@ts/ui/header"
import ConfirmAction from "@ts/ui/popups/confirm-action"
import { CreatePlaylistPopup } from "@ts/ui/popups/create-playlist"
import { Login } from "@ts/ui/popups/login"
import { RenamePlaylistPopup } from "@ts/ui/popups/rename-playlist"
import ToastManager from "@ts/ui/toast-manager"

document.cookie = "cookie=A cookie for Neuro-sama; max-age=260000; secure; samesite=none; path=/"

function HideLoading() {
    document.getElementById("loading-screen")?.classList.add("hide")
}

async function AsyncCrap() {
    if (!(await Network.CheckOnline())) {
        const loading = document.querySelector("#loading-screen")
        loading.innerHTML = "Failed to connect to server!"
        throw new Error("Failed to connect to server!")
    }

    await Promise.all([
        Network.GetSession(),
        SongDatabase.Initalise(),
        PlaylistDatabase.Initalise()
    ])

    setInterval(() => {
        if (!Network.IsOnline()) {
            Network.CheckOnline()
        }
    }, 60000)
}

window.isNewSession = !sessionStorage.getItem('visited')
sessionStorage.setItem('visited', 'true')

window.isMobile = window.matchMedia("(pointer: coarse)").matches
window.isTablet = window.isMobile && (Math.min(window.screen.width, window.screen.height) >= 768)


if (window.isMobile) {
    AudioPlayer.instance.Audio.preload = "auto"
    SwarmFM.TARGET_LATENCY = 3
    try {
        localStorage.setItem("volume", 0.8)
    } catch (e) {
        console.error(e)
    }
}

PlaylistTab.ShowLoggedOutScreen()

function OnLogin(isAdmin) {
    const loginButton = document.getElementById("header-login-button")
    loginButton.textContent = "Log Out"
    loginButton.onclick = async () => {
        const confirmation = await ConfirmAction.AskUser("Are you sure you want to log out?")
        if (confirmation) {
            await Network.LogOut()
        }
    }
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
    window.MediaView = document.createElement("st-media-view")
    document.body.append(window.MediaView)

    ToastManager.Create()

    if (window.innerWidth > 600) {
        CurrentSongBar.CreateDesktop()
        CreateButton()
    } else {
        CurrentSongBar.CreateMobile()
        CreateButton(true)
    }
    PopulateSearch("")
    ContextMenu.Initalise()

    MediaView.Create()
    SongFullscreen.Create()

    Login.CreateWindow()
    new CreatePlaylistPopup()
    new RenamePlaylistPopup()
    PopulateDiscover().catch((e) => {
        ShowErrorScreen()
        console.error(e)
    }).then(() => {
        if (document.readyState == "complete") {
            HideLoading()
        }
        else {
            window.addEventListener("load", HideLoading)
        }
    })

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
            PlaybackController.PlaySong(song)
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
})

function UpdateNavigatorTime(played, duration, loaded) {
    navigator.mediaSession.setPositionState({
        duration: duration,
        position: played,
    })
}

AudioPlayer.instance.OnTimeUpdate(UpdateNavigatorTime)
SwarmFM.instance.OnTimeUpdate(UpdateNavigatorTime)