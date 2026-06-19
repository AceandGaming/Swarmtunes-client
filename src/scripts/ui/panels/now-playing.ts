import interact from "interactjs";

import css from "@css/components/panels/now-playing.scss?inline"
import { UIObject } from "../ui";
import type { SongList } from "../components/list";
import "../components/list";
import { PlaybackController } from "@ts/playback";
import type { Song } from "@ts/types";

export class NowPlaying extends UIObject {
    private songList: SongList

    constructor() {
        super()
        const shadow = this.attachShadow({ mode: "open" })

        const style = document.createElement("style")
        style.textContent = css
        shadow.append(style)

        const header = document.createElement("header")
        header.innerHTML = `
            <img src="/src/assets/emotes/evil-cheer.webp">
            <h1 class="neuro-text">Now Playing</h1>
            <img src="/src/assets/emotes/neuro-cheer.webp">
        `
        shadow.append(header)

        this.songList = document.createElement("st-song-list")
        this.songList.Compact = true
        shadow.append(this.songList)
    }
    connectedCallback(): void {
        super.connectedCallback()

        PlaybackController.AddCallback("onQueueChange", (queue: Song[]) => {
            this.songList.Set(queue)
            this.songList.UpdateAnimated()
        })

        interact(this).resizable({
            edges: { top: false, right: true, bottom: false, left: false },
            listeners: {
                move(event) {
                    const target = event.target
                    const width = event.rect.width
                    target.style.width = width + "px"
                }
            }
        })
    }
}

customElements.define("st-now-playing", NowPlaying)
declare global {
    interface HTMLElementTagNameMap {
        "st-now-playing": NowPlaying
    }
}