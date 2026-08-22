<script lang="ts">
    import type { Playlist } from "@ts/models"
    import Popup from "@ts/ui/popups/popup.svelte"
    import PlaylistProvider from "@ts/playlist-provider"
    import { onMount, untrack } from "svelte"
    import ItemList from "@ts/ui/item-list.svelte"

    const { resolve }: {resolve: (playlist: Playlist|undefined) => any} = $props()

    let playlists: Playlist[] = $state([])
    let visible = $state(true)

    onMount(async () => {
        playlists = await PlaylistProvider.GetAll()
    })

    function onItemClick(playlist: Playlist) {
        resolve(playlist)
        untrack(() => visible = false)
    }

    $effect(() => {
        visible;
        resolve(undefined)
    })

</script>

<Popup title="Select Playlist" bind:visible>
    <ItemList items={playlists} {onItemClick} />
</Popup>