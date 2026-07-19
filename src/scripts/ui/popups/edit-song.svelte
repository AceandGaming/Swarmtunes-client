<script lang="ts">
    import { Song } from "@ts/types/song"
    import { onMount } from "svelte"
    import Network from "@ts/network"

    const { song }: {song: Song} = $props()

    let newTitle = $state("")
    let newArtists = $state("")
    let newSingers = $state("")
    let newCoverArt = $state("")

    export function Submit() {
        
    }

    onMount(() => {
        newTitle = song.Title
        newArtists = song.Artist
        newSingers = song.Singers.join(", ")
        newCoverArt = song.CoverArt ?? ""
    })

</script>

<div class="edit-song">
    <div class="cover-container">
        <swarmtunes-cover src={Network.GetCover(newCoverArt, 256)}></swarmtunes-cover>

        <input type="text" bind:value={newCoverArt} placeholder="Cover URL">
    </div>
    <div class="text-container">
        <input type="text" bind:value={newTitle} placeholder="Title">
        <input type="text" bind:value={newArtists} placeholder="Artist">
        <input type="text" bind:value={newSingers} placeholder="Singers">
    </div>
</div>

<style>
    .edit-song {
        display: flex;
        flex-direction: row;
    }
    swarmtunes-cover, img {
        width: 256px;
        height: 256px;
    }
    .cover-container {
        display: flex;
        flex-direction: column;
        align-items: left;
        gap: 10px
    }
    .text-container {
        display: flex;
        flex-direction: column;
        align-items: left;
        gap: 5px
    }
</style>


