<script lang="ts">
    import { IconX } from "@tabler/icons-svelte-runes"
    import type { Snippet } from "svelte"

    let { title = "", visible = $bindable(true), busy=$bindable(false), buttons, children }: {title?: string, visible?: boolean, busy?: boolean, buttons?: Snippet, children: Snippet} = $props()
</script>


<div class="popup-background" class:visible>
    <div class="popup" class:busy>
        <button type="button" class="close icon-button" onclick={() => visible = false}><IconX size="24" /></button>
        {#if title}
            <h1>{title}</h1>
        {/if}
        <div class="content">
            {@render children()}
        </div>
        {#if buttons}
            <div class="buttons">
                {@render buttons()}
            </div>
        {/if}
    </div>
</div>

<style>
    .popup-background {
        position: fixed;
        inset: 0;
        z-index: 3;

        display: flex;
        justify-content: center;
        align-items: center;

        background-color: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(6px);
    }
    .popup-background:not(.visible) {
        display: none;
    }
    .popup {
        --gap: clamp(5px, 2vw, 20px);

        position: relative;
        max-width: min(80vw, 700px);

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    
        gap: var(--gap);
        padding: clamp(10px, 10%, 40px);
    
        border-radius: 20px;
        color: var(--text-colour);
        background-color: color-mix(in srgb, var(--background-colour) 70%, transparent);

        box-shadow: 0 5px 15px #00000080;
    }
    .popup.busy {
        filter: brightness(0.5);
        transition: filter 0.2s ease-out;
        cursor: not-allowed;
    }
    .popup.busy :global(*) {
        pointer-events: none;
    }

    h1 {
        font-size: 2.5rem;
        font-weight: bold;
    }

    .close {
        position: absolute;
        top: 10px;
        right: 10px;
    }

    .content {
        display: flex;
        flex-direction: column;
        gap: var(--gap);

        text-align: center;
    }
    .content > :global(input) {
        height: 35px;
    }

    .buttons {
        width: 100%;

        display: flex;
        flex-direction: row;
        justify-content: center;

        gap: 10px;
    }
    .buttons > :global(button) {
        flex: 1;
        max-width: 100px;
        height: 35px;
        border-radius: 10px;
    }
</style>