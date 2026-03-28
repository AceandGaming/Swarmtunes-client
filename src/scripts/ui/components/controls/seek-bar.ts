import { UIObject } from "@ts/ui/ui";
import css from "@css/components/controls/seek-bar.scss?inline"
import { Device } from "@ts/device";
import { PlaybackController } from "@ts/playback";
import { FormatTime } from "@ts/utils";

export class SeekBar extends UIObject {
    private startTime: HTMLElement
    private endTime: HTMLElement
    private bar: HTMLElement

    constructor() {
        super()
        const shadow = this.attachShadow({ mode: "open" })
        const style = document.createElement("style")
        style.textContent = css
        shadow.append(style)

        this.startTime = document.createElement("span")
        this.startTime.textContent = "0:00"
        this.startTime.className = "time"
        this.endTime = document.createElement("span")
        this.endTime.textContent = "0:00"
        this.endTime.className = "time"
        this.bar = document.createElement("div")
        this.bar.className = "bar"

        if (Device.isMobile) {
            const OnMove = (e: TouchEvent) => this.CalculateSeek(e.touches[0].clientX)
            this.bar.addEventListener("touchstart", (e) => {
                OnMove(e)
                this.bar.addEventListener("touchmove", OnMove)
            })
            window.addEventListener("touchend", (e) => {
                this.bar.removeEventListener("touchmove", OnMove)
            })
        }
        else {
            const OnMove = (e: MouseEvent) => this.CalculateSeek(e.clientX)
            this.bar.addEventListener("mousedown", (e) => {
                OnMove(e)
                document.addEventListener("mousemove", OnMove)
            })
            window.addEventListener("mouseup", (e) => {
                document.removeEventListener("mousemove", OnMove)
            })
        }

        PlaybackController.OnTimeUpdate((played, duration, loaded) => this.OnTimeUpdate(played, duration, loaded))

        shadow.append(this.startTime, this.bar, this.endTime)
    }
    private OnTimeUpdate(played: number, duration: number, loaded: number) {
        if (duration == 0) {
            return
        }
        this.bar.style.setProperty("--played", `${(played / duration) * 100}%`)
        this.startTime.textContent = FormatTime(played)
        this.endTime.textContent = FormatTime(duration)
    }
    private CalculateSeek(x: number) {
        const rect = this.bar.getBoundingClientRect();
        let fraction = (x - rect.left) / rect.width;
        fraction = Math.min(1, Math.max(0, fraction));

        PlaybackController.Seek(fraction)
        console.log(fraction)
    }
    public async Initialise(mobileLayout: boolean) {
        if (mobileLayout) {
            this.startTime.style.display = "none"
            this.endTime.style.display = "none"
        }
    }
}

customElements.define("st-seek-bar", SeekBar)