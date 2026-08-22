<script lang="ts">
    import { GetPopup } from "@ts/ui/popup.svelte.ts" 

    const popup = $derived(GetPopup())
</script>


{#key popup}
    {#if popup}
        {const Comp = popup.component}
        <Comp {...popup.props} />
    {/if}
{/key}
