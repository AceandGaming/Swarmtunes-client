import "@css/themes.css"
import "@css/styles.css"

import "@ts/debug.ts"

import App from "@ts/app.svelte"
import { mount } from "svelte"
import { Initialize } from "@ts/login.svelte.ts"
import { InitMediaSession } from "@ts/media-session.ts"
import { ClearUrlBar, GetSongId } from "@ts/urlbar.ts"
import PlaybackController from "@ts/playback"
import SongProvider from "@ts/song-provider"




document.cookie = "cookie=A cookie for Neuro-sama; max-age=260000; secure; samesite=none; path=/"

window.isMobile = window.matchMedia("(pointer: coarse)").matches

const songId = GetSongId()

ClearUrlBar()

Initialize()
InitMediaSession()
mount(App, { target: document.body })

if (songId) {
    SongProvider.Get(songId).then(song => {
        if (song) {
            console.log("Found song", song)
            PlaybackController.Play({ song })
        }
    })
}