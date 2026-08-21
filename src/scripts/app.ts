import PlaybackController from "@ts/playback"
import { ResizeAllGridDisplays } from "@ts/ui/catagories"
import { PopulateDiscover, ShowErrorScreen } from "@ts/ui/content/discover"
import { MediaView } from "@ts/ui/content/media-view"
import PlaylistTab from "@ts/ui/content/playlist-tab"
import SongFullscreen from "@ts/ui/content/fullscreen.svelte"
import ContextMenu from "@ts/ui/content-menu/index.svelte"
import CurrentSongBar from "@ts/ui/controls/current-song-bar/index.svelte"
import { CreateButton, ShowContentWindow, UpdateTheme } from "@ts/ui/header"
import ConfirmAction from "@ts/ui/popups/confirm-action"
import { CreatePlaylistPopup } from "@ts/ui/popups/create-playlist"
import { Initialize as InitLogin, auth } from "@ts/login.svelte.ts"
import { RenamePlaylistPopup } from "@ts/ui/popups/rename-playlist"
import ToastManager from "@ts/ui/toast-manager"
import { NowPlaying } from "@ts/ui/now-playing"
import { InitMediaSession } from "@ts/media-session"
import { mount } from "svelte"
import { Logout, OnLogin as AddLoginCallback } from "@ts/login.svelte.ts"
import SongProvider from "@ts/song-provider"
import { GetPlaylists } from "@ts/api/playlist"
import PlaylistStore from "@ts/playlist-store"

document.cookie = "cookie=A cookie for Neuro-sama; max-age=260000; secure; samesite=none; path=/"

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations()
        .then(registrations => {
            registrations.forEach(registration => {
                registration.unregister()
            })
        })
}


function HideLoading() {
    document.getElementById("loading-screen")!.classList.add("hide")
}

window.isNewSession = !sessionStorage.getItem('visited')
sessionStorage.setItem('visited', 'true')

window.isMobile = window.matchMedia("(pointer: coarse)").matches
window.isTablet = window.isMobile && (Math.min(window.screen.width, window.screen.height) >= 768)


if (window.isMobile) {
    try {
        localStorage.setItem("volume", 0.8 as any)
    } catch (e) {
        console.error(e)
    }
}

InitMediaSession()

PlaylistTab.ShowLoggedOutScreen()

function OnLogin(isAdmin: boolean) {
    const loginButton = document.getElementById("header-login-button") as HTMLButtonElement
    loginButton.textContent = "Log Out"
    loginButton.onclick = async () => {
        const confirmation = await ConfirmAction.AskUser("Are you sure you want to log out?")
        if (!confirmation) {
            return
        }

        await Logout()
        location.reload()
    }
    GetPlaylists().then(playlists => {
        PlaylistStore.Init(playlists)
        PlaylistTab.Populate()
    })

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
AddLoginCallback((user) => {
    if (!user) {
        return
    }

    OnLogin(user.role === "admin")
})

function CreateUI() {
    ToastManager.Create()

    mount(CurrentSongBar, { target: document.querySelector("footer")! })
    if (window.innerWidth > 600) {
        CreateButton()
    } else {
        CreateButton(true)
    }
    mount(ContextMenu, { target: document.body })
    document.addEventListener("contextmenu", (e) => e.preventDefault())

    MediaView.Create()
    mount(SongFullscreen, { target: document.body })
    NowPlaying.Create()

    new CreatePlaylistPopup()
    new RenamePlaylistPopup()
    PopulateDiscover().catch((e: any) => {
        ShowErrorScreen()
        console.error(e)
    })

    ShowContentWindow(document.getElementById("discover"))
    UpdateTheme()

}
function CreatePostUI() {
    ResizeAllGridDisplays()
}

function LoadUrlBar() {
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    const songId = urlParams.get("song")
    //const playlistLink = urlParams.get("playlist")

    if (songId !== null) {
        SongProvider.Get(songId).then((song) => {
            if (song) {
                PlaybackController.Play({ song, songs: [song] })
            }
        })
    }
    // if (playlistLink !== null) {
    //     Login.AddLoginCallback(async () => {
    //         const playlist = await Network.AddSharedPlaylist(playlistLink)
    //         PlaylistManager.AddPlaylist(playlist)
    //         PlaylistTab.Populate()
    //     })
    // }

    const cleanUrl =
        window.location.protocol +
        "//" +
        window.location.host +
        window.location.pathname
    window.history.replaceState({}, document.title, cleanUrl)
}

CreateUI()
HideLoading()

InitLogin().then(() => {
    CreatePostUI()

    LoadUrlBar()
})