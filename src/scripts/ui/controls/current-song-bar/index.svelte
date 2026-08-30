<script lang="ts">
    import Desktop from "./desktop.svelte"
    import Mobile from "./mobile.svelte"
    import { MediaQuery } from "svelte/reactivity"

    let mobileLayout = new MediaQuery("max-width: 600px")
    
</script>

{#if mobileLayout.current}
    <Mobile />
{:else}
    <Desktop />
{/if}
