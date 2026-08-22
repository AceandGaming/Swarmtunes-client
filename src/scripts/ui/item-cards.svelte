<script lang="ts">
    import { Collection, Playlist, Song } from "@ts/models"
    import Cover from "@ts/ui/cover.svelte"
    import type { Color } from "colorthief"
    import { MediaView } from "@ts/ui/content/media-view"
    import { IconDisc, IconPlaylist } from "@tabler/icons-svelte-runes"
    import IconNote from "@assets/note.svelte"
    import ContextMenu from "@ts/context-menu.svelte.ts"
    import { CreateSongContextMenu, CreateCollectionContextMenu, CreatePlaylistContextMenu } from "@ts/context-menus"
    import { MobileHoldSvelte } from "@ts/mobile-hold"

    type item = Song | Collection | Playlist

    let { items, grid = false}: {items: Song[] | Collection[] | Playlist[], grid?: boolean} = $props()

    function OnCardClick(item: item) {
        MediaView.Update(item)
    }
    function ShowContextMenu(event: MouseEvent|TouchEvent, item: item) {
        let menu
        if (item instanceof Song) {
            menu = CreateSongContextMenu(item)
        } else if (item instanceof Collection) {
            menu = CreateCollectionContextMenu(item)
        } else if (item instanceof Playlist) {
            menu = CreatePlaylistContextMenu(item)
        }
        else {
            return
        }

        const x = event instanceof MouseEvent ? event.clientX : event.changedTouches[0].clientX
        const y = event instanceof MouseEvent ? event.clientY : event.changedTouches[0].clientY

        ContextMenu.Show({ options: menu, x: x, y: y })
    }
</script>

{#snippet Card(item: item)}
    {let colour: Color | undefined = $state()}
    {let colourCss = $derived.by(() => {
        if (!colour) {
            return undefined
        }
        const hsl = colour.hsl()
        return `hsl(${hsl.h} ${hsl.s}% ${Math.min(hsl.l / 1.1, 60)}%)`
    })}

    <div 
        class="card" 
        style:--colour={colourCss}

        onclick={() => OnCardClick(item)}
        oncontextmenu={(e) => ShowContextMenu(e, item)}
        {@attach MobileHoldSvelte((e) => ShowContextMenu(e, item))}
    >
        {const Icon = item instanceof Song ? IconNote : item instanceof Collection ? IconDisc : IconPlaylist}
        <div class="art-container">
            <div class="icon"><Icon size=20/></div>
            <Cover item={item} --size="100%" bind:colour />
        </div>
        <h1>{"shortTitle" in item ? item.shortTitle ?? item.displayTitle : item.displayTitle}</h1>
    </div>
{/snippet}


<div 
    class="item-cards"
    class:grid
>
    {#each items as item}
        {@render Card(item)}
    {/each}
</div>

<style>
    * {
        padding: 0;
        margin: 0;
        box-sizing: border-box;
    }

    .item-cards {
        display: flex;
        gap: 10px;

        max-width: 100%;
        width: min-content;

        overflow-x: auto;

        padding: 10px;
        background-color: var(--background-sub-colour);
        
        border-radius: 20px;
    }
    .item-cards.grid {
        flex-wrap: wrap;
        width: max-content;
        justify-content: center;
    }

    .card {
        flex: 0 0 auto;
        width: clamp(100px, 22vw, 180px);

        display: flex;
        flex-direction: column;

        background-color: var(--colour, var(--cover-background));

        border-radius: 10px;
        transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;

        cursor: pointer;
    }
    .card:hover {
        transform: rotate(2deg) scale(1.05);
        background-color: color-mix(in srgb, var(--colour, var(--cover-background)) 90%, white);
    }
    .card .art-container {
        position: relative;

        margin: 5px;
        margin-bottom: 0;
        border-radius: 10px;

        overflow: hidden;
    }
    .card h1 {
        display: block;

        width: 75%;
        height: auto;
        min-height: 1lh;
        max-height: 2lh;

        margin: 0 auto;

        overflow: hidden;

        text-align: center;
        font-size: medium;
        white-space: normal;
        overflow-wrap: normal;

        color: white;
    }
    .card .icon {
        position: absolute;

        z-index: 1;

        background-color: #00000070;
        padding: 2px;

        border-bottom-right-radius: 5px;
    }
</style>