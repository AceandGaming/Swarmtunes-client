<script lang="ts">
    import { onMount } from "svelte";
    import Desktop from "./desktop.svelte"
    import Mobile from "./mobile.svelte"

    let mobileLayout = $state(window.isMobile)
    
    onMount(() => {
        mobileLayout = window.innerWidth < 600
        window.addEventListener("resize", () => {
            mobileLayout = window.innerWidth < 600
        })
    })
</script>

{#if mobileLayout}
    <Mobile />
{:else}
    <Desktop />
{/if}
