<script lang="ts">
    import PlaylistStore from "@ts/playlist-store.svelte.ts"
    import ItemCards from "@ts/ui/item-cards.svelte"
    import { auth } from "@ts/login.svelte.ts"
    import { ShowLogin, CreatePlaylist } from "@ts/ui/popup.svelte.ts"
</script>

<div id="playlists-tab">
    {#if auth.loggedIn}
        <button onclick={() => CreatePlaylist()}>Create Playlist</button>
        <ItemCards items={PlaylistStore.GetAll()} grid={true} />
    {:else}
        <div class="error-screen">
            <span>Login Required</span>
            <button onclick={() => ShowLogin()}>Login</button>
        </div>
    {/if}
</div>

<style>
    button {
        border-radius: 999px;
        font-size: medium;
        padding: 3px 8px;
        width: 140px;
        margin-bottom: 20px;
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