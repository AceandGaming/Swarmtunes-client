import Controller from "@ts/playback"
import type { Song } from "@ts/models/song"

function CreatePlaybackState() {
    let playing: boolean = $state(false)

    let shuffle: boolean = $state(Controller.shuffle)
    let repeat: boolean = $state(Controller.repeat)
    let volume: number = $state(Controller.volume)

    let played: number = $state(0)
    let duration: number = $state(0)

    let currentSong: Song | undefined = $state(Controller.currentSong)
    let queue: Song[] = $state([])


    Controller.AddCallback("playPause", v => playing = v)
    Controller.AddCallback("shuffle", v => shuffle = v)
    Controller.AddCallback("repeat", v => repeat = v)
    Controller.AddCallback("volumeChange", v => volume = v)
    Controller.AddCallback("timeUpdate", (newPlayed: number, newDuration: number) => {
        played = newPlayed
        duration = newDuration
    })
    Controller.AddCallback("loadedSong", v => currentSong = v)
    Controller.AddCallback("queueChange", (newQueue: Song[]) => {
        queue = newQueue
    })



    return {
        get playing() { return playing },
        get shuffle() { return shuffle },
        get repeat() { return repeat },
        get volume() { return volume },
        get played() { return played },
        get duration() { return duration },
        get currentSong() { return currentSong },
        get queue() { return queue },

        set playing(val) {
            if (val) {
                Controller.Play()
            } else {
                Controller.Pause()
            }
        },

        set shuffle(val) {
            Controller.SetShuffle(val)
        },
        set repeat(val) {
            Controller.SetRepeat(val)
        },
        set volume(val) {
            Controller.volume = val
        },

        set played(val) {
            Controller.Seek(val)
        },

        Play: (...args: Parameters<typeof Controller.Play>) => Controller.Play(...args),
        Pause: () => Controller.Pause(),
        PlayPause: () => Controller.PlayPause(),
        Next: () => Controller.Next(),
        Previous: () => Controller.Previous(),

        Seek: (time: number) => Controller.Seek(time),
        SeekPercent: (percent: number) => Controller.SeekPercent(percent),

        ToggleShuffle: () => Controller.ToggleShuffle(),
        ToggleRepeat: () => Controller.ToggleRepeat()
    }
}

const PlaybackState = CreatePlaybackState()
export default PlaybackState