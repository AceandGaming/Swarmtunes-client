class PlaybackController {
    public static get HasControl(): AudioBase|null {
        if (this.Audio.HasControl) {
            return AudioPlayer.instance
        }
        else if (this.SwarmFM.HasControl) {
            return SwarmFM.instance
        }
        else {
            return null
        }
    }
    public static get Playing(): boolean {
        const audio = PlaybackController.HasControl
        return audio ? !audio.Paused : false
    }
    
    private static get Audio() {
        return AudioPlayer.instance
    }
    private static get SwarmFM() {
        return SwarmFM.instance
    }

    public static Play() {
        const audio = PlaybackController.HasControl
        if (audio) {
            audio.Play()
        }
    }
    public static Pause() {
        const audio = PlaybackController.HasControl
        if (audio) {
            audio.Pause()
        }
    }
    public static NextTrack() {
        if (!this.Audio.HasControl) {
            return
        }
        SongQueue.PlayNextSong()
    }
    public static PreviousTrack() {
        if (!this.Audio.HasControl) {
            return
        }
        if (AudioPlayer.instance.Played > 5) {
            AudioPlayer.instance.Played = 0
            return
        }
        SongQueue.PlayPreviousSong()
    }
    private static UpdateMetadata(title: string, artist: string, singers: string[], coverUrl: string) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: title,
            artist: artist,
            album: singers.join(", "),
            artwork: [{ src: coverUrl }],
        })
    }
    public static UpdateMediaSession({playPause = false, skipping = false, seeking = false}) {
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
            media.setActionHandler('play', () => this.Play())
            media.setActionHandler('pause', () => this.Pause())
            media.setActionHandler('stop', () => this.Pause())
        }
        if (skipping) {
            media.setActionHandler('nexttrack', () => this.NextTrack())
            media.setActionHandler('previoustrack', () => this.PreviousTrack())
        }
        if (seeking) {
            media.setActionHandler('seekbackward', (details) => this.Audio.Skip(details.seekOffset ?? 0))
            media.setActionHandler('seekforward', (details) => this.Audio.Skip(-(details.seekOffset ?? 0)))
            media.setActionHandler('seekto', (details) => this.Audio.Played = details.seekTime ?? 0)
        }
    }
    public static Display(title: string, artist: string, singers: string[], coverUrl: string) {
        this.UpdateMetadata(title, artist, singers, coverUrl)
        CurrentSongBar.Display(title, artist, singers, coverUrl)
        SongFullscreen.Display(title, artist, singers, coverUrl)
    }
    public static DisplaySong(song: Song) {
        this.Display(
            song.Title,
            song.Artist,
            song.Singers,
            Network.GetCover(song.Cover, 512)
        )
    }
    public static DisplaySwarmFMInfo(info: SwarmFMInfo) {
        let cover = Network.GetCover(info.currentSong.Cover, 512)
        if (info.currentSong.HasCustomCover) {
            cover = Network.swarmFMURL + "/assets/" + info.currentSong.Cover + ".png"
        }
        this.Display(
            info.currentSong.Title,
            info.currentSong.Artist,
            info.currentSong.Singers,
            cover
        )
        if (!isMobile) {
            SongFullscreen.DisplaySwarmFM()
        }
    }
}