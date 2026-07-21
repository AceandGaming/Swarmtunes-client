import type { Song } from "@ts/types/song"
import EditSong from "@ts/ui/popups/edit-song.svelte"
import PopupWindow from "@ts/ui/popups/popup"
import { mount, unmount } from "svelte"

//Wrapper for the svelte component
export class EditSongPopup extends PopupWindow {
    component: EditSong

    constructor(song: Song) {
        super("Edit Song")
        this.component = mount(EditSong, {
            target: this.content,
            props: { song }
        })
        this.CreateButton("Cancel", () => this.Close())
        this.CreateButton("Submit", () => this.component.Submit())
    }
    Close() {
        super.Close()
        unmount(this.component)
    }
}