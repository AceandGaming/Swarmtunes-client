abstract class AudioBase {
    public abstract get Audio(): HTMLAudioElement
    public abstract get Played(): number
    public abstract get Loaded(): number
    public abstract get Duration(): number
    public abstract get Paused(): boolean
    public abstract get Volume(): number
    public abstract get HasControl(): boolean

    public abstract set Paused(value: boolean)
    public abstract set Volume(value: number)

    public abstract Play(...args: unknown[]): void
    public abstract Pause(): void
    public abstract Clear(): void

    public abstract OnPlayPause(callback: (state: boolean) => void): void
    public abstract OnTimeUpdate(callback: (played: number, duration: number, loaded: number) => void): void
}