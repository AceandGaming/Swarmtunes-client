import PlaybackController from "@ts/playback"
import type { Song } from "@ts/models/song"

function UpdateMediaMetadata(song: Song) {
    if (!navigator.mediaSession) {
        return
    }

    document.title = `${song.title} - Swarmtunes`

    navigator.mediaSession.metadata = new MediaMetadata({
        title: song.displayTitle,
        artist: song.displayArtists,
        album: song.displaySingers,
        artwork: [
            { src: song.GetArtwork() ?? "/no-song.png" },
        ]
    })
}

export function UpdateMediaControls({ playPause = false, skipping = false, seeking = false } = {}) {
    const media = navigator.mediaSession

    media.setActionHandler('play', null)
    media.setActionHandler('pause', null)
    media.setActionHandler('stop', null)
    media.setActionHandler('nexttrack', null)
    media.setActionHandler('previoustrack', null)
    media.setActionHandler('seekbackward', null)
    media.setActionHandler('seekforward', null)
    media.setActionHandler('seekto', null)

    if (playPause) {
        media.setActionHandler('play', () => PlaybackController.Play())
        media.setActionHandler('pause', () => PlaybackController.Pause())
        media.setActionHandler('stop', () => PlaybackController.Pause())
    }
    if (skipping) {
        media.setActionHandler('nexttrack', () => PlaybackController.Next())
        media.setActionHandler('previoustrack', () => PlaybackController.Previous())
    }
    if (seeking) {
        if (!window.isMobile) {
            media.setActionHandler('seekbackward', (details) => {
                PlaybackController.SeekSkip(details.seekOffset ?? 0)
            })
            media.setActionHandler('seekforward', (details) => {
                PlaybackController.SeekSkip(details.seekOffset ?? 0)
            })
        }
        media.setActionHandler('seekto', (details) => {
            PlaybackController.Seek(details.seekTime ?? 0)
        })
    }
}

export function InitMediaSession() {
    if (!navigator.mediaSession) {
        return
    }

    navigator.mediaSession.metadata = new MediaMetadata({
        title: "Swarmtunes",
        artist: "nothing playing...",
        artwork: [
            { src: "/icon.png", type: "image/png" },
        ]
    })

    UpdateMediaControls()

    PlaybackController.AddCallback("playPause", (playing) => {
        navigator.mediaSession.playbackState = playing ? "playing" : "paused"
    })
    PlaybackController.AddCallback("timeUpdate", (played, duration) => {
        navigator.mediaSession.setPositionState({ position: Math.min(played, duration), duration: duration })
    })
    PlaybackController.AddCallback('loadedSong', (song) => {
        UpdateMediaMetadata(song)
    })
    PlaybackController.AddCallback('queueChange', (_, loaded) => {
        UpdateMediaControls({
            playPause: true,
            skipping: loaded.length > 1,
            seeking: true
        })
    })
}