import playlistStore from "@ts/playlist-store.svelte"
import { auth } from "@ts/login.svelte.ts"
import { GetPlaylists } from "@ts/api/playlist"

let loading = $state(false)

$effect.root(() => {
    $effect(() => {
        const id = auth.user?.id

        if (!id) {
            playlistStore.Clear()
            return
        }

        loading = true
        GetPlaylists().then(playlists => {
            if (auth.user?.id !== id) {
                return
            }
            playlistStore.Init(playlists)

        }).finally(() => {
            loading = false
        })
    })
})

export const session = {
    get loading() {
        return loading
    }
}