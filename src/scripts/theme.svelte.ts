const themes = [
    { name: "dark", icon: "/icons/moon.svg" },
    { name: "neuro", icon: "/icons/newero.avif" },
    { name: "evil", icon: "/icons/newliv.avif" }
] as const

let currentTheme = $state(0)

$effect.root(() => {
    $effect(() => {
        document.documentElement.dataset.theme = themes[currentTheme].name

        try {
            localStorage.setItem("theme", currentTheme.toString())
        } catch (e) {
            console.error("Failed to save theme", e)
        }
    })
})

export function LoadTheme() {
    try {
        const theme = localStorage.getItem("theme")
        if (theme) {
            currentTheme = parseInt(theme)
        }
    } catch (e) {
        console.error("Failed to load theme", e)
    }
}

export default {
    get current() {
        return themes[currentTheme]
    },
    Cycle() {
        currentTheme = (currentTheme + 1) % themes.length
    }
}