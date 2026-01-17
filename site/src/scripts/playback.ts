class PlaybackController {
    public static get HasControl(): AudioBase | null {
        if (this.SwarmFM.HasControl) {
            return this.SwarmFM
        }
        else if (this.Audio.HasControl) {
            return this.Audio
        }
        else if (this.Youtube.HasControl) {
            return this.Youtube
        }
        return null
    }
    public static get CurrentSong(): Song | undefined {
        if (this.Audio.HasControl) {
            return this.Audio.CurrentSong
        }
        else if (this.Youtube.HasControl) {
            return this.Youtube.CurrentSong
        }
        return undefined
    }
    public static get Audio() {
        return this.audio
    }
    public static get SwarmFM() {
        return this.swarmfm
    }
    public static get Youtube() {
        return this.youtube
    }

    public static get Playing(): boolean {
        return this.HasControl ? !this.HasControl.Paused : false
    }

    public static get Shuffle(): boolean {
        return localStorage.getItem("suffle") === "true"
    }
    public static set Shuffle(value: boolean) {
        localStorage.setItem("suffle", value.toString())
    }



    private static callbacks: { [key: string]: any[] } = {}
    private static audio = new AudioPlayer()
    private static swarmfm = new SwarmFM()
    private static youtube = new YoutubePlayer()

    private static CallCallbacks(name: string, prams: any) {
        if (this.callbacks[name]) {
            this.callbacks[name].forEach((callback: any) => callback(prams))
        }
    }
    public static AddCallback(name: string, callback: any) {
        if (!this.callbacks[name]) {
            this.callbacks[name] = []
        }
        this.callbacks[name].push(callback)
    }

    public static NextSong() {
        const song = SongQueue.Next()
        this.Play(song)
    }
    public static PreviousSong() {
        const song = SongQueue.Previous()
        this.Play(song)
    }
    public static PlaySonglist(songlist: Song[], currentSong?: Song) {
        SongQueue.PopulateQueue(songlist, this.Shuffle)
        currentSong = currentSong || SongQueue.CurrentSong
        if (!currentSong) {
            console.warn("No current song")
            return
        }
        this.Play(currentSong)
    }

    public static Play(song?: Song) {
        if (song) {
            if (song.YoutubeId) {
                this.Youtube.Play(song)
            }
            else {
                this.Audio.Play(song)
            }
            this.CallCallbacks("onSongChange", song)
        }
        else {
            this.HasControl?.Play()
        }
        const metadata = this.HasControl?.Metadata
        if (!metadata) {
            return
        }
        MetadataDisplay.Display(this.HasControl.Metadata)
        this.CallCallbacks("onMetadataChange", metadata)

        this.CallCallbacks("onPlay", true)
    }
    public static PlaySwarmFM() {
        this.SwarmFM.Play()
        if (this.SwarmFM.Metadata) {
            MetadataDisplay.Display(this.SwarmFM.Metadata)
            this.CallCallbacks("onMetadataChange", this.SwarmFM.Metadata)
        }
        this.CallCallbacks("onPlay", true)
    }
    public static Pause() {
        this.HasControl?.Pause()
        this.CallCallbacks("onPlay", false)
    }
}