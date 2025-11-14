class LoadingText {
    static Attach(element) {
        if (element.querySelector(".loading-text")) {
            return
        }
        const loading = document.createElement("div")
        loading.classList.add("loading-text")
        element.appendChild(loading)
    }
    static Detach(element) {
        const text = element.querySelector(".loading-text")
        if (text) {
            text.remove()
        }
    }
}