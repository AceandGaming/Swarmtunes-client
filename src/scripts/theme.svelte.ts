const themes = [
    { name: "Dark", id: "dark" },
    //{ name: "Light", id: "light" },
    { name: "Neuro", id: "neuro" },
    { name: "Evil", id: "evil" }
] as const

let currentTheme = $state(0)

$effect.root(() => {
    $effect(() => {
        document.documentElement.dataset.theme = themes[currentTheme].id

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
    get themes() {
        return themes
    },
    Cycle() {
        currentTheme = (currentTheme + 1) % themes.length
    },
    SetTheme(id: string) {
        currentTheme = themes.findIndex(theme => theme.id === id)
    }
}