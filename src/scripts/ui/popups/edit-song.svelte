<script lang="ts">
    import { Song } from "@ts/types/song"
    import { onMount } from "svelte"
    import Network from "@ts/network"
    import "@ts/ui/cover"

    const { song }: {song: Song} = $props()

    let newTitle = $state("")
    let newArtists = $state("")
    let newSingers = $state("")
    let newCoverArt = $state("")
    let newDate = $state("")
    let newStatus = $state(0)

    $inspect(newDate)

    export function Submit() {
        const metadata: Json = {}
        if (newTitle != song.Title) {
            metadata["title"] = newTitle
        }
        if (newArtists != song.Artist) {
            metadata["artists"] = newArtists.split(", ")
        }
        if (newSingers != song.Singers.join(", ")) {
            metadata["singers"] = newSingers.split(", ")
        }
        if (newCoverArt != song.CoverArt) {
            if (newCoverArt.startsWith("custom/")) {
                metadata["customArtwork"] = newCoverArt.split("custom/")[1]
            }
        }
        if (newDate != song.Date.toISOString().split("T")[0]) {
            metadata["date"] = new Date(newDate).toISOString()
        }
        // Currently the client has no idea if it's claimed or not. So we just set it regardless
        metadata["copyrightStatus"] = ["active", "copyright_claimed"][newStatus]

        Network.UpdateSong(song.Id, metadata)
    }

    onMount(() => {
        newTitle = song.Title
        newArtists = song.Artist
        newSingers = song.Singers.join(", ")
        newCoverArt = song.CoverArt ?? ""
        newDate = song.Date.toISOString().split("T")[0]
    })

</script>

<div class="edit-song">
    <div class="cover-container">
        <swarmtunes-cover src={Network.GetCover(newCoverArt, 256)}></swarmtunes-cover>

        <input type="text" bind:value={newCoverArt} placeholder="Cover URL">
    </div>
    <div class="text-container">
        <span>Title</span>
        <input type="text" bind:value={newTitle} placeholder="Title">

        <span>Artists</span>
        <input type="text" bind:value={newArtists} placeholder="Artists">

        <span>Singers</span>
        <input type="text" bind:value={newSingers} placeholder="Singers">

        <span>Date Released</span>
        <input type="date" bind:value={newDate} placeholder="Date Released">

        <span>Status</span>
        <select bind:value={newStatus}>
            <option value={0}>Active</option>
            <option value={1}>Copyright Claimed</option>
        </select>
    </div>
</div>

<style>
    .edit-song {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 20px
    }
    swarmtunes-cover {
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
    .text-container span {
        margin-bottom: -2px;
        margin-top: 10px;
    }
</style>


