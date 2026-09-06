<script lang="ts">
    import PlaybackState from "@ts/playback.svelte"
    import ItemList from "@ts/ui/item-list.svelte"
    import { CreateSongContextMenu } from "@ts/context-menus";
    import type { Song } from "@ts/models"
    import { ContextMenuGroup } from "@ts/context-menu.svelte"
    import { IconX } from "@tabler/icons-svelte-runes"
    import { untrack } from "svelte"

    function ContextMenu(song: Song) {
        let menu = CreateSongContextMenu(song)
        menu = menu.filter(m => m.group !== ContextMenuGroup.Queue)

        menu.push({
            label: "Remove from Queue",
            group: ContextMenuGroup.Queue,
            icon: IconX,
            Action: () => {
                PlaybackState.RemoveFromQueue(song)
            }
        })
        
        return menu
    }
</script>

<div id="now-playing">
    <div class="title">
        <img src="/emotes/evil-cheer.webp" alt="">
        <h1>Now Playing</h1>
        <img src="/emotes/neuro-cheer.webp" alt="">
    </div>
    <div class="scroll">
        <ItemList 
            items={PlaybackState.queue.slice(0, 20)}
            extraInfo={false} 
            contextMenuButton={false} 
            animate={true}
            draggable={true}

            onItemClick={(song) => PlaybackState.SkipTo(song)}
            contextMenu={ContextMenu}
            onReorder={(songs) => PlaybackState.ReorderQueue(songs.map(s => s.id))}
            
            --font-size="0.9rem" 
        />
    </div>
</div>

<style>
    #now-playing {
        width: 250px;

        display: flex;
        flex-direction: column;

        padding: 10px;
        padding-bottom: 0;
        gap: 10px;
        background-color: var(--background-colour);
    }
    .title {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;

        gap: 5px;
        padding-bottom: 5px;

        border-bottom: solid 1px var(--subtext-colour);
    }
    .title :first-child {
        transform: scaleX(-1);
    }
    .title img {
        height: 32px;
        width: auto;
    }
    h1 {
        font-size: 1.5rem;
    }
    .scroll {
        overflow-y: auto;
        overflow-x: hidden;
        height: 100%;
    }

    @media (max-width: 800px) {
        #now-playing {
            width: 180px;
        }
        img {
            display: none;
        }
    }
</style>