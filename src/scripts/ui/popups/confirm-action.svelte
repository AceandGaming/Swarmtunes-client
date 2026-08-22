<script lang="ts">
    import Popup from "@ts/ui/popups/popup.svelte"
    import { untrack } from "svelte"

    const { message, resolve }: {message?: string, resolve: (result: boolean) => any} = $props()

    let visible = $state(true)

    function Submit() {
        resolve(true)
        untrack(() => visible = false)
    }

    $effect(() => {
        visible;
        if (!visible) {
            resolve(false)
        }
    })
</script>

<Popup title="Are you sure?" bind:visible>
    <p>{message}</p>
    {#snippet buttons()}
        <button onclick={() => visible = false}>Cancel</button>
        <button onclick={Submit}>Confirm</button>
    {/snippet}
</Popup>