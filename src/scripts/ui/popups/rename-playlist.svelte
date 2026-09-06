<script lang="ts">
    import Popup from "@ts/ui/popups/popup.svelte"
    import PlaylistProvider from "@ts/playlist-provider"
    import { HttpError } from "@ts/api/network"
    import type { Playlist } from "@ts/models"

    const { playlist }: {playlist: Playlist} = $props()

    let visible = $state(true)
    let busy = $state(false)
    // svelte-ignore state_referenced_locally
    let name = $state(playlist.title)

    let errorMessage = $state("")

    async function Submit() {
        busy = true
        try {
            await PlaylistProvider.RenamePlaylist(playlist.id, name)
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

<Popup title="Rename Playlist" bind:visible bind:busy>
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
        <button onclick={Submit}>Rename</button>
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
