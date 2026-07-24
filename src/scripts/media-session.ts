import type { PlaybackController } from "@ts/playback"
import type { Song } from "@ts/types/song"

export function InitMediaSession() {
    if (!navigator.mediaSession) {
        return
    }

    navigator.mediaSession.metadata = new MediaMetadata({
        title: "Swarmtunes",
        artwork: [
            { src: "/icon.png", type: "image/png" },
        ]
    })

}

export function UpdateMediaMetadata(song: Song) {
    if (!navigator.mediaSession) {
        return
    }

    navigator.mediaSession.metadata = new MediaMetadata({
        title: song.Title,
        artist: song.Artist,
        album: song.Singers.join(", "),
        artwork: [
            { src: song.CoverUrl },
        ]
    })
}

// export function UpdateMediaControls({ playPause = false, skipping = false, seeking = false }, controller: PlaybackController) {
//     const media = navigator.mediaSession

//     media.setActionHandler('play', null)
//     media.setActionHandler('pause', null)
//     media.setActionHandler('stop', null)
//     media.setActionHandler('nexttrack', null)
//     media.setActionHandler('previoustrack', null)
//     media.setActionHandler('seekbackward', null)
//     media.setActionHandler('seekforward', null)
//     media.setActionHandler('seekto', null)

//     if (playPause) {
//         media.setActionHandler('play', () => PlaybackController.Play())
//         media.setActionHandler('pause', () => PlaybackController.Pause())
//         media.setActionHandler('stop', () => PlaybackController.Pause())
//     }
//     if (skipping) {
//         media.setActionHandler('nexttrack', () => PlaybackController.NextTrack())
//         media.setActionHandler('previoustrack', () => PlaybackController.PreviousTrack())
//     }
//     if (seeking) {
//         if (!window.isMobile) {
//             media.setActionHandler('seekbackward', (details) => {
//                 this.Audio.Skip(details.seekOffset ?? 0)
//                 this.Youtube.Skip(details.seekOffset ?? 0)
//             })
//             media.setActionHandler('seekforward', (details) => {
//                 this.Audio.Skip(details.seekOffset ?? 0)
//                 this.Youtube.Skip(details.seekOffset ?? 0)
//             })
//         }
//         media.setActionHandler('seekto', (details) => {
//             this.Audio.Played = details.seekTime ?? 0
//             this.Youtube.Played = details.seekTime ?? 0
//         })
//     }
// }