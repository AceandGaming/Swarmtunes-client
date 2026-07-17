import { AudioBase } from "@ts/audio-base"
import Network from "@ts/network"
import PlayState from "@ts/play-state"
import { PlaybackController } from "@ts/playback"
import SongQueue from "@ts/song-queue"
import SongRequester from "@ts/song-requester"
import type { Song } from "@ts/types/song"
import SeekBar from "@ts/ui/controls/seek-bar"

export default class AudioPlayer extends AudioBase {
    static instance = new AudioPlayer();

    get Audio(): HTMLAudioElement {
        return this.audio
    }
    get Played(): number {
        return this.audio.currentTime
    }
    set Played(value: number) {
        if (!this.HasControl || !isFinite(value)) {
            return
        }
        try {
            this.audio.fastSeek(value)
        }
        catch {
            this.audio.currentTime = value
        }
    }
    get Loaded(): number {
        if (!this.audio.buffered.length) {
            return 0
        }
        return this.audio.buffered.end(this.audio.buffered.length - 1)
    }
    get Duration(): number {
        return this.audio.duration || 0
    }
    get Paused(): boolean {
        return this.paused
    }
    set Paused(value: boolean) {
        if (value) {
            this.Pause()
        }
        else {
            this.Play()
        }
    }
    get Volume(): number {
        return this.volume
    }
    set Volume(value: number) {
        this.volume = value
        this.audio.volume = value
    }
    get HasControl(): boolean {
        return this.hasControl
    }
    get CurrentSong(): Song | undefined {
        return this.currentSong
    }

    private audio: HTMLAudioElement
    private hasControl: boolean = false
    private paused: boolean = true
    private volume: number = 0.5
    private currentSong: Song | undefined

    constructor() {
        super()
        this.audio = new window.Audio
        this.audio.preload = "metadata"
    }

    public async PrepForSong() {
        this.audio.pause()
        this.audio.src = ""
        this.currentSong = undefined

        for (const seek of SeekBar.seekbars) {
            seek.Clear()
        }
    }
    public async Preload(songId: id) {
        await this.PrepForSong()
        this.audio.src = Network.GetAudioURL(songId)
        this.audio.load()
    }
    public async Load(song: Song) {
        this.hasControl = true
        this.audio.volume = this.volume
        this.currentSong = song
        const src = await SongRequester.GetAudioUrl(song.Id)
        if (this.audio.src !== src) {
            this.audio.src = src
            this.audio.currentTime = 0
            this.audio.load()
        }
        PlaybackController.DisplaySong(song)
        PlayState.Update({ currentSongId: song.Id })
        PlaybackController.UpdateMediaSession({ playPause: true, skipping: SongQueue.songCount > 1, seeking: true })
    }
    public Play(song?: Song): void {
        if (PlaybackController.HasControl != this && PlaybackController.HasControl) {
            PlaybackController.HasControl.Clear()
        }
        this.hasControl = true
        this.paused = false
        this.audio.volume = this.volume
        if (song) {
            if (window.isMobile) {
                this.Load(song).then(() => this.audio.play())
            }
            else {
                this.audio.oncanplay = () => {
                    if (!this.hasControl) {
                        return
                    }
                    this.audio.play()
                }
                this.Load(song)
            }

        }
        else {
            if (this.audio.src === "") {
                return
            }
            this.audio.play()
        }
        PlaybackController.UpdateMediaSession({ playPause: true, skipping: SongQueue.songCount > 1, seeking: true })
    }
    public Pause(): void {
        this.audio.pause()
        this.paused = true
    }
    public Clear(): void {
        this.Pause()
        this.hasControl = false
    }

    public OnPlayPause(callback: (state: boolean) => void): void {
        this.audio.addEventListener("play", () => callback(true))
        this.audio.addEventListener("pause", () => callback(false))
    }
    public OnTimeUpdate(callback: (played: number, duration: number, loaded: number) => void): void {
        this.audio.addEventListener("timeupdate", () => callback(this.Played, this.Duration, this.Loaded))
    }
    public OnVolumeUpdate(callback: (volume: number) => void): void {
        this.audio.addEventListener("volumechange", () => callback(this.Volume))
    }

    public Seek(fraction: number): void {
        if (!this.HasControl) {
            return
        }
        this.Played = fraction * this.audio.duration
        this.Play()
    }
    public Skip(seconds: number): void {
        if (!this.HasControl) {
            return
        }
        this.Played += seconds
        this.Play()
    }
}