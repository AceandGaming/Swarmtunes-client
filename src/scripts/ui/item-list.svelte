<script lang="ts" generics="T extends Item">
    import { Playlist, Song } from "@ts/models"
    import Cover from "@ts/ui/cover.svelte"
    import { flipNoScale } from "@ts/misc"
    import { IconDotsVertical, IconCircleArrowDownFilled as IconDown } from "@tabler/icons-svelte-runes"
    import { CreateSongContextMenu, CreatePlaylistContextMenu } from "@ts/context-menus"
    import ContextMenu, { type ContextMenuOption } from "@ts/context-menu.svelte.ts"
    import { MobileHoldSvelte } from "@ts/mobile-hold"
    import { GetDownloads } from "@ts/song-downloads.svelte"
    import Sortable from "sortablejs"
    import { onMount } from "svelte"

    type Item = Playlist | Song
    type Props<T extends Item> = {
        items: T[]
        animate?: boolean
        extraInfo?: boolean
        contextMenuButton?: boolean
        draggable?: boolean
        contextMenu?: (item: T) => ContextMenuOption[]
        onItemClick?: (item: T) => void
        onReorder?: (items: T[]) => void
    }

    let {
        items = $bindable(),
        animate = false,
        extraInfo = true,
        contextMenuButton = true,
        contextMenu,
        onItemClick,
        onReorder,
        draggable = false
    }: Props<T> = $props();

    let element: HTMLElement

    let toggledFlip = $derived(animate ? flipNoScale : () => ({ duration: 0 }))
    let sortable: Sortable

    let itemLookup = $derived(new Map(items.map(item => [item.id, item])))

    function OpenContextMenu(event: MouseEvent | TouchEvent, item: T) {
        let menu
        if (contextMenu) {
            menu = contextMenu(item)
        }
        else if (item instanceof Song) {
            menu = CreateSongContextMenu(item)
        } 
        else if (item instanceof Playlist) {
            menu = CreatePlaylistContextMenu(item)
        }
        else {
            return
        }

        const x = event instanceof MouseEvent ? event.clientX : event.changedTouches[0].clientX
        const y = event instanceof MouseEvent ? event.clientY : event.changedTouches[0].clientY

        ContextMenu.Show({ options: menu, x: x, y: y })
    }

    onMount(() => {
        sortable = new Sortable(element, {
            animation: animate ? 150 : 0,
            disabled: !draggable,
            onUpdate: (e) => {
                // @ts-ignore
                const ids: string[] = [...e.to.children].map((el: HTMLElement) => el.dataset.id)
                items = ids.map(id => itemLookup.get(id)).filter(item => item !== undefined)

                onReorder?.(items)
            }
        })

        return () => {
            sortable.destroy()
        }
    })
    $effect(() => {
        sortable.option("disabled", !draggable);
    })

</script>

<ul bind:this={element} class="item-list">
    {#each items as item (item.id)}
        <li 
            animate:toggledFlip={{ duration: 300}}
            onclick={() => onItemClick?.(item)}
            class:unavailable={"playable" in item && !item.audioInfo.playable}

            data-id={item.id}
            
            oncontextmenu={(e) => OpenContextMenu(e, item)} 
            {@attach MobileHoldSvelte((e) => OpenContextMenu(e, item))}
        >
            <div class="cover-wrapper">
                <Cover {item} />
                {#if extraInfo && item instanceof Song && GetDownloads().has(item.id)}
                    <IconDown size="unset" />
                {/if}
            </div>
            <div class="info">
                <h1>
                    {item.displayTitle}
                </h1>
                <h2 class="sub-text">{item instanceof Song ? (item.displayArtists) : `${item.songCount} songs`}</h2>
            </div>
            {#if extraInfo}
                <div class="extra-info">
                    <p class="sub-text">{item.displayDate}</p>
                    {#if item instanceof Song}
                        <p class="sub-text">{item.displaySingers}</p>
                    {/if}
                </div>
            {/if}
            {#if contextMenuButton}
                <button class="context-menu-button icon-button" onclick={(e) => {e.stopPropagation(); OpenContextMenu(e, item)}}>
                    <IconDotsVertical size="100%" />
                </button>
            {/if}

        </li>
    {/each}
</ul>

<style>
    li {
        height: 55px;

        display: flex;
        flex-direction: row;
        align-items: center;
    
        gap: 5px;
        padding: 5px;
    
        border-radius: 10px;

        transition: background-color 0.1s ease;
        cursor: pointer;
    }
    li:hover {
        background-color: #ffffff20;
    }
    li.unavailable {
        filter: grayscale(1);
        opacity: 0.5;
        cursor: not-allowed;
    }

    li .cover-wrapper {
        position: relative;
        height: 100%;
        width: auto;
        aspect-ratio: 1;
    }
    .cover-wrapper > :global(.cover) {
        height: 100%;
        width: 100%;
    }
    .cover-wrapper > :global(svg) {
        position: absolute;
        right: 1px;
        bottom: 1px;
        height: 12px;
        aspect-ratio: 1;
    }

    li > button {
        height: 50%;
        aspect-ratio: 1;
    }
    @media (hover: hover) {
        li > button {
            opacity: 0;
            transition: opacity 0.1s ease;
        }
        li:hover > button {
            opacity: 1;
        }
    }
    

    li .info {
        flex: 1;
        min-width: 0;

        display: flex;
        flex-direction: column;
        gap: 1px;
    }
    li .extra-info {
        display: flex;
        flex-direction: column;
        gap: 5px;
    
        justify-content: right;
        text-align: right;
    }

    li :is(h1, h2) {
        font-weight: normal;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
    li h1 {
        font-size: var(--font-size, 1rem);
    }
    h1 > :global(svg) {
        display: inline-block;
        vertical-align: middle;
    }
    li h2 {
        font-size: calc(var(--font-size, 1rem) * 0.8);
    }
</style>