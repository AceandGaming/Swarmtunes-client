import type { Component } from "svelte"
import type { Playlist } from "@ts/models"

import LoginPopup from "@ts/ui/popups/login.svelte"
import ConfirmPopup from "@ts/ui/popups/confirm-action.svelte"
import SelectPlaylistPopup from "@ts/ui/popups/select-playlist.svelte"
import CopyLinkPopup from "@ts/ui/popups/copy-link.svelte"
import CreatePlaylistPopup from "@ts/ui/popups/create-playlist.svelte"
import RenamePlaylistPopup from "@ts/ui/popups/rename-playlist.svelte"


type PopupRequest = {
    component: Component<any>
    props?: Record<string, unknown>
}

let currentPopup: PopupRequest | undefined = $state.raw()

export function GetPopup() {
    return currentPopup
}

export function ShowLogin() {
    currentPopup = {
        component: LoginPopup
    }
}
export function ConfirmAction(message: string): Promise<boolean> {
    return new Promise((resolve) => {
        currentPopup = {
            component: ConfirmPopup,
            props: {
                message,
                resolve
            }
        }
    })
}
export function SelectPlaylist(): Promise<Playlist | undefined> {
    return new Promise((resolve) => {
        currentPopup = {
            component: SelectPlaylistPopup,
            props: {
                resolve
            }
        }
    })
}
export async function CopyToClipboard(link: string) {
    try {
        await navigator.clipboard.writeText(link)
    }
    catch {
        await new Promise((resolve) => {
            currentPopup = {
                component: CopyLinkPopup,
                props: {
                    resolve,
                    link
                }
            }
        })
    }
}
export function CreatePlaylist() {
    currentPopup = {
        component: CreatePlaylistPopup
    }
}
export function RenamePlaylist(playlist: Playlist) {
    currentPopup = {
        component: RenamePlaylistPopup,
        props: {
            playlist
        }
    }
}