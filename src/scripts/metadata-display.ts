export interface Metadata {
    title: string
    artists: string[]
    singers: string[]
    coverUrl: string
    date: string
    audioSource: string
}

export class MetadataDisplay {
    private static UpdateSessionMetadata(data: Metadata) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: data.title,
            artist: data.title,
            album: data.singers.join(", "),
            artwork: [{ src: data.coverUrl }],
        })
    }
    public static Display(data: Metadata) {
        this.UpdateSessionMetadata(data)
        document.title = "Swarmtunes - " + data.title
    }
    // public static UpdateMediaSession({ playPause = false, skipping = false, seeking = false }) {
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
    //         media.setActionHandler('nexttrack', () => PlaybackController.NextSong())
    //         media.setActionHandler('previoustrack', () => PlaybackController.PreviousSong())
    //     }
    //     if (seeking) {
    //         if (!isMobile) {
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
}