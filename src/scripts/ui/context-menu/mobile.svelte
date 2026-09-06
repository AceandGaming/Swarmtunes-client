<script lang="ts">
    import { state as MenuState } from "@ts/context-menu.svelte"
    import type { ContextMenuOption } from "@ts/context-menu.svelte"
    import { onMount } from "svelte";

    let menu: HTMLElement
    let currentOptions: ContextMenuOption[] = $state([])
    
    $effect(() => {
        currentOptions = MenuState.options
    })

    onMount(() => {
        function OnClick(event: TouchEvent) {
            if (menu.contains(event.target as Node)) {
                return
            }

            if (MenuState.visible) {
                event.stopImmediatePropagation()
            }
            MenuState.visible = false
        }

        document.addEventListener("touchstart", OnClick, { capture: true, passive: false })

        return () => {
            document.removeEventListener("touchstart", OnClick)
        }
    })
</script>

<menu 
    id="context-menu"
    class:visible={MenuState.visible}

    bind:this={menu}
>
    {#each currentOptions as option, i}
        {#if option.visible !== false}
            {#if i > 0 && option.group !== currentOptions[i - 1].group}
                <hr />
            {/if}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <li 
                role="menuitem"

                ontouchend={async () => {
                    if (option.options) {
                        currentOptions = option.options
                    }

                    if (!option.Action) {
                        return
                    }
                    MenuState.visible = false
                    option.Action()
                }}
            >
                <span>{option.label}</span>
                {#if option.icon}
                    <option.icon size="unset" />
                {:else}
                    <svg></svg>
                {/if}
            </li>
        {/if}
    {/each}
</menu>

<style>
    #context-menu {
        position: fixed;
        bottom: 0;

        z-index: 100;

        display: block;
        width: 100vw;
        min-height: 30dvh;
        max-height: 50dvh;
        padding-top: 5%;

        border-radius: 20px 20px 0 0;
        background-color: color-mix(var(--colour-surface-alt), transparent 70%);
        backdrop-filter: blur(6px);
        border: solid 2px var(--colour-border);
        border-bottom: none;

        overflow-y: scroll;

        transform: translateY(100%);

        transition: transform 0.2s ease;
    }
    #context-menu.visible {
        transform: translateY(0);
    }

    li {
        height: 40px;

        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: left;

        gap: 5px;
        padding: 5px;
        border-radius: 10px;

        list-style: none;
    }
    li:active {
        background-color: #ffffff20;
    }
    li > :global(svg) {
        height: 100%;
        width: auto;
        aspect-ratio: 1;
    }
    li > span {
        flex: 1;
    }

    hr {
        width: calc(100% - 10px);
        margin: 4px auto;
        color: var(--colour-text-muted);
    }
</style>