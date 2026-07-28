<script lang="ts">
    //wrapper for song-list.ts
    import { onMount } from "svelte"
    import {SongList} from "@ts/ui/song-list"
    import type { Song } from "@ts/types/song"

    let { songs, animate = false, onClick, catagory }: {
        songs: Song[], 
        animate?: boolean, 
        onClick?: (event: any) => void
        catagory?: string
    } = $props()

    // svelte-ignore state_referenced_locally
    const songList = new SongList([], onClick, catagory)

    
    $effect(() => {
        songList.songs = songs

        if (!songList.element.isConnected) {
            return
        }

        if (animate) {
            songList.UpdateAnimated()
        } else {
            songList.Update()
        }
    })
</script>

<div bind:this={songList.element as any}></div>