<script lang="ts">
    import type { Snippet } from "svelte"

    const { title, description = "", children }: {title: string, description?: string, children?: Snippet} = $props()
</script>


<div class="error-screen">
    <h1>{title}</h1>
    {#if description}
        <p class="sub-text">{description}</p>
    {/if}
    {#if children}
        {@render children()}
    {/if}
</div>

<style>
    .error-screen {
        position: absolute;
        inset: 0;
    
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 20px;
    }
    .error-screen h1 {
        font-size: 2rem;
    }
</style>