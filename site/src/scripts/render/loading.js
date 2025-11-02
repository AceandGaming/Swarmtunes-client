class LoadingText {
    static Attach(element) {
        const loading = document.createElement("div")
        loading.classList.add("loading")
        element.appendChild(loading)
    }
    static Detach(element) {
        element.querySelector(".loading").remove()
    }
}