import PlaybackController from "@ts/playback"
import SongQueue from "@ts/song-queue"
import SongRequester from "@ts/song-requester"
import type { Song } from "@ts/types/song"

export default class PlayState {
    static awaitingSong?: Song

    static Update({ currentSongId, played, songIds, playing }: { currentSongId?: string, played?: number, songIds?: string[], playing?: boolean } = {}) {
        const json = localStorage.getItem("playState")
        let data: any = {}
        if (json) {
            data = JSON.parse(json)
        }

        if (currentSongId) {
            data.currentSong = currentSongId
        }
        if (played) {
            data.played = played
        }
        if (songIds) {
            data.queue = songIds
        }
        if (playing !== undefined) {
            data.playing = playing
        }
        try {
            localStorage.setItem("playState", JSON.stringify(data))
        }
        catch (e) {
            console.error("Failed to save play state", e)
        }
    }
    static async Load() {
        const json = localStorage.getItem("playState")
        if (!json) {
            return
        }
        const data = JSON.parse(json)
        if (!data.currentSong) {
            return
        }

        console.log("Loaded play state", data)

        if (data.currentSong == "swarmfm") {
            //SwarmFM.instance.Play()
            return
        }
        const song = await SongRequester.GetSong(data.currentSong)
        if (!song) {
            return
        }
        // if (PlaybackController.CurrentSong !== undefined) {
        //     return
        // }
        // PlaybackController.DisplaySong(song)
        // if (!window.isNewSession && data.playing) {
        //     PlaybackController.PlaySong(song)
        //     if (data.played) {
        //         let die = false //POV: You haven't implemented the ablity to remove callbacks
        //         PlaybackController.OnPlayPause((state) => {
        //             if (state && !die) {
        //                 die = true
        //                 if (PlaybackController.HasControl) {
        //                     PlaybackController.HasControl.Played = data.played
        //                 }
        //             }
        //         })
        //     }
        // }
        else {
            this.awaitingSong = song
        }


        if (data.queue.length == 0) {
            return
        }
        const songs = await SongRequester.GetSongs(data.queue)
        // SongQueue.LoadSongs(songs)
        // SongQueue.UpdateQueue(song)
    }
    static Initalise() {
        PlaybackController.AddCallback("timeUpdate", (played) => {
            PlayState.Update({ played: played })
        })
        PlaybackController.AddCallback("playPause", (playing) => {
            PlayState.Update({ playing: playing })
        })
        this.Load()
    }
}

window.PlayState = PlayState