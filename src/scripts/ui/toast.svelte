<script lang="ts">
    import { IconXboxXFilled as IconFail, IconCircleCheckFilled as IconSuccess} from '@tabler/icons-svelte-runes';
    import { fade, fly } from 'svelte/transition';
    import { GetToasts } from "@ts/toast.svelte.ts"
    import { MediaQuery } from "svelte/reactivity"
    import { flip } from 'svelte/animate';

    let mobileLayout = new MediaQuery("max-aspect-ratio: 1/1")

</script>

<ol id="toasts">
    {#each GetToasts() as toast (toast.id)}
        <li
            in:fly={{delay: 100, ...(mobileLayout.current ? { y: 20 } : { x: 20 })}}
            out:fade={{duration: 100}}
            animate:flip={{duration: 300}}
        >
            {#if toast.type == "failure"}
                <IconFail style="color: red;"/>
            {:else if toast.type == "success"}
                <IconSuccess style="color: lime;"/>
            {/if}
            <p>{toast.message}</p>
        </li>
    {/each}
</ol>

<style>
    #toasts {
        position: absolute;
        top: 10px;
        right: 20px;
        width: min(80%, 300px);

        padding: 0;
        margin: 0;

        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 5px;

        z-index: 1000;

        list-style-type: none;
        pointer-events: none;
    }

    li {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: left;
        gap: 5px;

        width: 100%;
        background-color: var(--colour-surface-raised);

        padding: 3px 5px;
        text-align: center;
        
        border-radius: 9999px;
    }
    li > p:last-child {
        margin-left: 5px
    }

    li > :global(svg) {
        width: 20px;
        min-width: 20px;
        height: 100%;
    }

    @media (max-aspect-ratio: 1/1) {
        #toasts {
            right: unset;
            left: 50%;
            transform: translateX(-50%);

            align-items: center;
        }
    }
</style>