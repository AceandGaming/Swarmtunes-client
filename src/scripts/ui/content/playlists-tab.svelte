<script lang="ts">
    import PlaylistStore from "@ts/playlist-store.svelte.ts"
    import ItemCards from "@ts/ui/item-cards.svelte"
    import { auth } from "@ts/login.svelte.ts"
    import { ShowLogin, CreatePlaylist } from "@ts/ui/popup.svelte.ts"
    import { session } from "@ts/session.svelte";

</script>

<div id="playlists-tab">
    {#if auth.loggedIn}
        {#if session.loading}
            <div class="loading-text"></div>
        {:else}
            <button onclick={() => CreatePlaylist()}>Create Playlist</button>
            <ItemCards items={PlaylistStore.GetAll()} grid={true} />
        {/if}
    {:else}
        <div class="error-screen">
            <h1>Login Required</h1>
            <button onclick={() => ShowLogin()}>Login</button>
        </div>
    {/if}
</div>

<style>
    #playlists-tab {
        display: flex;
        flex-direction: column;
        padding: 20px;
        overflow-y: auto;
    }

    button {
        width: 140px;
        margin-bottom: 20px;
    }
    .error-screen {
        position: absolute;
        inset: 0;
    
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 20px;
    }
    .error-screen h1 {
        font-size: 2rem;
    }

    .loading-text {
        margin: 20px auto;
    }

    @media (max-width: 600px) {
        #playlists-tab {
            padding: 10px;
        }
        button {
            margin: 20px auto;
            padding: 5px 8px;
        }
    }
</style>