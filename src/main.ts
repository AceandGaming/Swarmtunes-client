import "@css/themes.css"
import "@css/styles.css"
import App from "@ts/app.svelte"
import { mount } from "svelte"
import { Initialize } from "@ts/login.svelte.ts"
import { InitMediaSession } from "@ts/media-session.ts"

document.cookie = "cookie=A cookie for Neuro-sama; max-age=260000; secure; samesite=none; path=/"

window.isMobile = window.matchMedia("(pointer: coarse)").matches

Initialize()
InitMediaSession()
mount(App, { target: document.body })