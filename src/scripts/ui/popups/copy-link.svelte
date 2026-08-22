<script lang="ts">
    import Popup from "@ts/ui/popups/popup.svelte"

    const { link }: {link: string} = $props()

    let visible = $state(true)

    function Submit() {
        navigator.clipboard.writeText(link)
        .then(() => {
            visible = false
        })
        .catch(console.error)
    }
</script>

<Popup bind:visible>
    <input type="text" value={link} readonly>
    {#snippet buttons()}
        <button onclick={Submit}>Copy</button>
    {/snippet}
</Popup>