<script lang="ts">
    import { MediaQuery } from "svelte/reactivity"
    import Desktop from "./desktop.svelte"
    import Mobile from "./mobile.svelte"

    let mobileLayout = new MediaQuery("max-width: 600px")
</script>

{#if mobileLayout.current}
    <Mobile />
{:else}
    <Desktop />
{/if}
