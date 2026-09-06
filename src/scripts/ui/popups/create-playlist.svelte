<script lang="ts">
    import Popup from "@ts/ui/popups/popup.svelte"
    import PlaylistProvider from "@ts/playlist-provider"
    import { HttpError } from "@ts/api/network"

    let visible = $state(true)
    let busy = $state(false)
    let name = $state("")

    let errorMessage = $state("")

    async function Submit() {
        busy = true
        try {
            await PlaylistProvider.CreatePlaylist(name)
        }
        catch (e) {
            if (e instanceof HttpError) {
                errorMessage = e.message
                return
            }
            console.error(e)
            errorMessage = "An unknown error occurred"
        }
        finally {
            busy = false
        }
        
        visible = false
    }
    $effect(() => {
        name;
        errorMessage = ""
    })
</script>

<Popup title="Create Playlist" bind:visible bind:busy>
    <input 
        class:error={errorMessage} 
        type="text" 
        placeholder="Playlist Name" 
        
        bind:value={name}
        onkeydown={(e) => e.key === "Enter" && Submit()}
    >
    {#if errorMessage}
        <p class="error">{errorMessage}</p>
    {/if}
    {#snippet buttons()}
        <button onclick={Submit}>Create</button>
    {/snippet}
</Popup>

<style>
    p.error {
        color: red;
        font-size: 0.8rem;
    }
    input.error {
        border-color: red;
    }
</style>
