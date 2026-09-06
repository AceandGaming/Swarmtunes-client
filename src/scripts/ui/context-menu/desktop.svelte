<script lang="ts">
    import { state as MenuState } from "@ts/context-menu.svelte"
    import type { ContextMenuOption } from "@ts/context-menu.svelte"
    import { onMount } from "svelte";

    let menu: HTMLElement

    onMount(() => {
        function OnClick(event: MouseEvent) {
            if (menu.contains(event.target as Node)) {
                return
            }

            MenuState.visible = false
        }
        function OnScroll() {
            MenuState.visible = false
        }

        document.addEventListener("mousedown", OnClick)
        window.addEventListener("scroll", OnScroll, true)

        return () => {
            document.removeEventListener("mousedown", OnClick)
            window.removeEventListener("scroll", OnScroll)
        }
    })
</script>

{#snippet CreateMenu(options: ContextMenuOption[], depth = 0)}
    {#each options as option, i}
        {#if option.visible !== false}
            {#if i > 0 && option.group !== options[i - 1].group}
                <hr />
            {/if}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <li 
                role="menuitem"
                style:anchor-name = {`--menu-${i}-${depth}`}

                onclick={async () => {
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
                {#if option.options}
                    <menu class="sub-menu" style:position-anchor = {`--menu-${i}-${depth}`}>{@render CreateMenu(option.options, depth + 1)}</menu>
                {/if}
            </li>
        {/if}
    {/each}
{/snippet}

<div 
    class="context-ancher"

    style:--x="{MenuState.x}px"
    style:--y="{MenuState.y}px"
></div>
<menu 
    id="context-menu"
    class:visible={MenuState.visible}

    bind:this={menu}
>
    {@render CreateMenu(MenuState.options)}
</menu>

<style>
    .context-ancher {
        position: fixed;
        left: var(--x);
        top: var(--y);

        anchor-name: --root-anchor;
    }

    menu {
        position: fixed;

        position-area: span-bottom right;
        position-try-fallbacks:
            span-bottom left,
            span-top right,
            span-top left;;

        display: none;
        min-width: 150px;

        z-index: 100;

        background-color: var(--colour-surface-alt);
        border-radius: 10px;
        border: solid 1px var(--colour-border);
        box-shadow: 0 2px 10px #00000080;

        opacity: 0;
        transform: scale(0.8);
        transform-origin: top left;

        transition: 
            opacity 0.2s ease, 
            transform 0.2s ease, 
            display 0.2s allow-discrete;
    }
    #context-menu {
        position-anchor: --root-anchor;
    }
    #context-menu.visible, li:hover > menu {
        opacity: 1;
        transform: scale(1);
        display: block;
    }

    @starting-style {
        #context-menu.visible, li:hover > menu {
            opacity: 0;
            transform: scale(0.8);
        }
    }

    li {
        height: 32px;

        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: left;

        gap: 5px;
        padding: 5px;
        border-radius: 10px;

        list-style: none;
    }
    li:hover {
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
        color: var(--text-colour-muted);
    }

</style>