class PlayState {
    static Update({ currentSongId, played, songIds } = {}) {
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
        localStorage.setItem("playState", JSON.stringify(data))
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

        if (data.currentSong == "swarmfm") {
            SwarmFM.instance.Play()
            return
        }
        const song = await Network.GetSong(data.currentSong)
        if (!song) {
            return
        }
        AudioPlayer.instance.Play(song)
        if (data.played) {
            AudioPlayer.instance.Played = data.played
        }

        if (data.queue.length == 0) {
            return
        }
        const songs = await Network.GetSong(data.queue)
        SongQueue.LoadSongs(songs)
        SongQueue.UpdateQueue(song)
    }
    static Initalise() {
        AudioPlayer.instance.OnTimeUpdate((played, duration, loaded) => {
            PlayState.Update({ played: played })
        })
        this.Load()
    }
}