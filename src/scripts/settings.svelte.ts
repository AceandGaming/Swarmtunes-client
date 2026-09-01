function Load() {
    try {
        const value = localStorage.getItem("settings")
        if (value === null) {
            return undefined
        }
        return JSON.parse(value)
    }
    catch (e) {
        console.error("Failed to get settings", e)
    }
}

const settings = $state(Load() ?? {
    useOriginalLanguage: false
})

$effect.root(() => {
    $effect(() => {
        try {
            localStorage.setItem("settings", JSON.stringify(settings))
        } catch (e) {
            console.error("Failed to save settings", e)
        }
    })
})

export default settings