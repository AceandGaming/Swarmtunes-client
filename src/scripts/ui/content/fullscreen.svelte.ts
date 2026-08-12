let visible = $state(false)

export default {
    get visible() {
        return visible
    },

    Show() {
        visible = true
    },

    Hide() {
        visible = false
    }
}