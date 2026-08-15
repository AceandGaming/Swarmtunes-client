<script lang="ts">
    import { Song } from "@ts/models/song"
    import { onMount } from "svelte"
    import { GetCoverUrl } from "@ts/api/song"
    import "@ts/ui/cover.svelte"

    const { song }: {song: Song} = $props()

    let newTitle = $state("")
    let newArtists = $state("")
    let newSingers = $state("")
    let newCoverArt = $state("")
    let newDate = $state("")
    let newStatus = $state(0)

    $inspect(newDate)

    export function Submit() {
        const metadata: any = {}
        if (newTitle != song.title) {
            metadata["title"] = newTitle
        }
        if (newArtists != song.artists.join(", ")) {
            metadata["artists"] = newArtists.split(", ")
        }
        if (newSingers != song.singers.join(", ")) {
            metadata["singers"] = newSingers.split(", ")
        }
        // if (newCoverArt.startsWith("custom/")) {
        //     metadata["customArtwork"] = newCoverArt.split("custom/")[1]
        // }
        if (newDate != song.dateReleased.toISOString().split("T")[0]) {
            metadata["date"] = new Date(newDate).toISOString()
        }
        // Currently the client has no idea if it's claimed or not. So we just set it regardless
        metadata["copyrightStatus"] = ["active", "copyright_claimed"][newStatus]

        //Network.UpdateSong(song.Id, metadata)
    }

    onMount(() => {
        newTitle = song.title
        newArtists = song.artists.join(", ")
        newSingers = song.singers.join(", ")
        //newCoverArt = (new URL(song.CoverUrl)).pathname
        newDate = song.dateReleased.toISOString().split("T")[0]
    })

</script>

<div class="edit-song">
    <div class="cover-container">
        <swarmtunes-cover src={GetCoverUrl(newCoverArt)}></swarmtunes-cover>

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


