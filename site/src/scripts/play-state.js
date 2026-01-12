class PlayState {
    static awaitingSong = undefined

    static Update({ currentSongId, played, songIds, playing } = {}) {
        const json = localStorage.getItem("playState")
        let data = {}
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
        if (song === undefined) {
            return
        }
        if (PlaybackController.CurrentSong !== undefined) {
            return
        }
        PlaybackController.DisplaySong(song)
        if (!isNewSession && data.playing) {
            PlaybackController.PlaySong(song)
            if (data.played) {
                let die = false //POV: You haven't implemented the ablity to remove callbacks
                PlaybackController.OnPlayPause((state) => {
                    if (state && !die) {
                        die = true
                        PlaybackController.HasControl.Played = data.played
                    }
                })
            }
        }
        else {
            this.awaitingSong = song
        }


        if (data.queue.length == 0) {
            return
        }
        const songs = await SongRequester.GetSongs(data.queue)
        SongQueue.LoadSongs(songs)
        SongQueue.UpdateQueue(song)
    }
    static Initalise() {
        PlaybackController.OnTimeUpdate((played, duration, loaded) => {
            PlayState.Update({ played: played })
        })
        setInterval(() => {
            PlayState.Update({ playing: PlaybackController.Playing })
        }, 500)
        this.Load()
    }
}