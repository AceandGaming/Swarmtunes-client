import type { Network } from "@ts/network"
import type { Login } from "@ts/ui/popups/login"
import type { PlaybackController } from "@ts/playback"
import type { PlayState } from "@ts/playback"
import type { SongQueue } from "@ts/playback"
import type { SongRequester } from "@ts/song-requester"
import type { MediaView } from "@ts/ui/content/media-view"

declare global {
    interface Window {
        Network: typeof Network
        Login: typeof Login
        SongRequester: typeof SongRequester
        MediaView: MediaView

        isMobile: boolean
        isTablet: boolean
        isNewSession: boolean
    }

    type Json =
        | string
        | number
        | boolean
        | null
        | Json[]
        | { [key: string]: Json }
    type id = string

    var YT: any
    var onYouTubeIframeAPIReady: () => void
}