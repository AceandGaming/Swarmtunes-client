<script lang="ts">
    import Toggle from "@ts/ui/components/toggle.svelte"
    import { auth, Logout } from "@ts/login.svelte.ts"
    import { ShowLogin } from "@ts/ui/popup.svelte.ts"
    import Settings from "@ts/settings.svelte.ts"

    import Theme from "@ts/theme.svelte.ts"

    async function OnDebugButtonClick() {
        const { CreateDebugDump } = await import("@ts/debug.ts")
        const { CopyToClipboard } = await import("@ts/ui/popup.svelte.ts")

        const dump = await CreateDebugDump()
        CopyToClipboard(dump)
    }
</script>

{#snippet settingInfo(text: string, description?: string)}
    <div class="info">
        <h1>{text}</h1>
        {#if description}
            <p class="sub-text">{description}</p>
        {/if}
    </div>
{/snippet}



<div id="settings">
    <div class="setting">
        {@render settingInfo("Theme")}
        <select value={Theme.current.id} onchange={(e: any) => Theme.SetTheme(e.target.value)}>
            {#each Theme.themes as theme}
                <option value={theme.id}>{theme.name}</option>
            {/each}
        </select>
    </div>
    <div class="setting">
        {@render settingInfo("Use Original Langauge", "Shows title and artist names of songs in their original language.")}
        <Toggle bind:value={Settings.useOriginalLanguage}/>
    </div>

    {#if window.isMobile}
        <footer class="quick-access">
            {#if auth.loggedIn}
                <button onclick={() => Logout()}>Logout</button>
            {:else}
                <button onclick={() => ShowLogin()}>Login</button>
            {/if}
        </footer>
    {/if}
    <button class="debug-button" onclick={OnDebugButtonClick}>Debug</button>
</div>

<style>
    #settings {
        position: relative;
        --gap: clamp(1rem, 2vw, 2rem);

        display: flex;
        flex-direction: column;
        overflow-y: auto;
        gap: var(--gap);

        padding: var(--gap);
    }
    .quick-access {
        display: flex;
        flex-direction: row;
        gap: 1rem;

        align-items: center;
        justify-content: center;

        margin-top: auto;
    }

    .setting {
        display: grid;
        grid-template-columns: 1fr auto;
        grid-template-rows: auto;
        gap: 1em;

        align-items: center;

        >:not(.info) {
            max-height: 30px;
            width: clamp(150px, 20vw, 300px);
        }
    }

    .info {
        display: flex;
        flex-direction: column;
        gap: 0.2em;

        max-width: 80%;

        h1 {
            font-size: 0.9rem;
        }
        p {
            font-size: 0.8rem;
        }
    }

    .debug-button {
        position: absolute;
        bottom: var(--gap);
        left: var(--gap);
    }
</style>