<script lang="ts" module>
    import { IconLayoutGrid, IconWorld, IconSettings } from "@tabler/icons-svelte-runes";
    const pages = {
        playlists: {
            icon: IconLayoutGrid,
            import: () => import("@ts/ui/content/playlists-tab.svelte"),
            label: "Libary"
        },
        discover: {
            icon: IconWorld,
            import: () => import("@ts/ui/content/discover.svelte"),
            label: "Discover"
        },
        search: {
            icon: IconSettings,
            import: () => import("@ts/ui/content/settings.svelte"),
            label: "Settings"
        }
    }
    function GetPage(page: keyof typeof pages) {
        return pages[page]
    }
</script>


<script lang="ts">
    import { GetKeys } from "@ts/misc";
    import NowPlaying from "@ts/ui/now-playing.svelte"
    import CurrentSongBar from "@ts/ui/controls/current-song-bar/index.svelte"
    import Fullscreen from "@ts/ui/content/fullscreen.svelte"
    import { GetPopup } from "@ts/ui/popup.svelte.ts"
    import { MediaQuery } from "svelte/reactivity";
    import MediaView from "@ts/ui/content/media-view.svelte"
    import MediaViewState from "@ts/ui/content/media-view.svelte.ts"
    import { auth, Logout } from "@ts/login.svelte.ts"
    import { ConfirmAction, ShowLogin } from "@ts/ui/popup.svelte.ts";
    import ContextMenu from "@ts/ui/context-menu/index.svelte"


    let currentPage: keyof typeof pages = $state("discover")
    let mobile = new MediaQuery("max-width: 600px")

    const popup = $derived(GetPopup())

    async function OnLoginButtonClick() {
        if (!auth.loggedIn) {
            ShowLogin()
        }
        else {
            if (await ConfirmAction("Are you sure you want to logout?")) {
                await Logout()
            }
        }
    }
</script>


{#snippet tabs()}
    <div class="tabs">
        {#each GetKeys(pages) as name}
            {const page = GetPage(name)}
            <button class:active={currentPage === name} onclick={() => {MediaViewState.Hide(); currentPage = name}}>
                <page.icon />
                <p>{page.label}</p>
            </button>
        {/each}
    </div>
{/snippet}
{#snippet headerButtons()}
    <div class="buttons">
        <a style="font-size: 1rem" class="sub-text about" href="about">About</a>
        <button onclick={OnLoginButtonClick}>{auth.loggedIn ? "Logout" : "Login"}</button>
    </div>
{/snippet}


<main id="app">
    {#if mobile.current}
        <footer>
            <CurrentSongBar />
            {@render tabs()}
        </footer>
    {:else}
        <header>
            {@render tabs()}
            {@render headerButtons()}
        </header>
        <footer>
            <CurrentSongBar />
        </footer>
    {/if}
    <NowPlaying />
    <div class="content">
        {#if MediaViewState.visible}
            <MediaView />
        {:else}
            {#await GetPage(currentPage).import() then page}
                <page.default />
            {/await}
        {/if}
    </div>
</main>
<ContextMenu />
<Fullscreen />
{#key popup}
    {#if popup}
        {const Comp = popup.component}
        <Comp {...popup.props} />
    {/if}
{/key}

<svelte:document oncontextmenu={e => e.preventDefault()}></svelte:document>

<style>
    main {
        position: fixed;
        inset: 0;

        display: grid;

        background-color: var(--background-sub-colour);

        grid-template-columns: auto 1fr;
        grid-template-rows: auto 1fr auto;
        grid-template-areas: 
        "now-playing header"
        "now-playing content"
        "footer footer";
    }
    header {
        grid-area: header;

        display: flex;
        flex-direction: row;
        align-items: center;

        padding: 0 5px;

        background: linear-gradient(var(--header-colour), var(--background-colour));
        box-shadow: 0 5px 5px -3px #00000050;
    }
    footer {
        grid-area: footer;
        background-color: var(--background-colour);
    }
    .tabs {
        display: flex;
        flex-direction: row;
        justify-content: left;
        align-items: end;
        gap: 5px;
    }
    header .tabs {
        flex: 1;
        height: 100%;
    }
    footer .tabs {
        justify-content: center;

        padding: 0 5vw;
        padding-bottom: 10px;
    }
    .tabs button {
        flex: 1;
        max-width: 120px;

        display: flex;
        flex-direction: row-reverse;
        align-items: center;
        justify-content: center;

        gap: 5px;
        font-weight: bold;

        background-color: var(--header-tab-default);
    }
    .tabs button.active {
        background-color: var(--background-colour);
    }

    header .tabs button { 
        padding: 2px;
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
        font-size: 0.8rem;
    }
    footer .tabs button {
        height: 60px;
        max-width: none;
        justify-content: center;
        flex-direction: column;

        background-color: var(--background-colour);
        font-size: 0.6rem;
    }
    footer .tabs button.active {
        background-color: var(--header-tab-default);
    }

    header .buttons {
        display: flex;
        flex-direction: row;
        justify-content: right;
        align-items: center;
        gap: 10px;
        padding: 10px;
    }
    #app > :global(#now-playing) {
        grid-area: now-playing;
        margin-right: 2px;
    }
    .content {
        grid-area: content;
        min-height: 0;
        overflow: hidden;

        background: var(--background)
    }
    .content > :global(*) {
        position: relative;
        height: 100%;
        width: 100%;
        overflow: hidden;
    }

    @media (max-width: 700px) {
        main {
            grid-template-columns: 1fr;
            grid-template-areas: 
            "header"
            "content"
            "footer";
        }

        #app > :global(#now-playing) {
            display: none !important;
        }


    }
    @media (max-width: 600px) {
        header {
            justify-content: right;
        }
        header .buttons {
            padding: 4px;
            gap: 15px;
        }
        header .about {
            position: absolute;
            left: 10px;
        }
    }
</style>
