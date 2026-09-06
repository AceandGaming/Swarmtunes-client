<script lang="ts">
    let { value: active = $bindable(false) }: {value?: boolean} = $props()
</script>

<div class="toggle" class:active onclick={() => active = !active}></div>

<style>
    .toggle {
        --s: var(--size, 25px);
        --g: calc(var(--s) / 6);

        container-type: inline-size;

        position: relative;
        height: var(--s);
        aspect-ratio: 2/1;

        border-radius: 9999px;
        background-color: var(--colour-accent);
        border: solid 1.5px var(--colour-border);
        cursor: pointer;

        transition: background-color 0.2s ease;
    }
    .toggle.active {
        background-color: var(--colour-enabled);
    }

    .toggle::after {
        content: "";

        position: absolute;

        margin: calc(var(--g) / 2);

        height: calc(100% - var(--g));
        width: auto;

        aspect-ratio: 1;
        border-radius: 9999px;

        background-color: white;
        filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 40%));

        transition: left 0.2s ease, transform 0.2s ease;
    }
    .toggle.active::after {
        transform: translateX(calc(100cqw - 100% - var(--g)));
    }
</style>
