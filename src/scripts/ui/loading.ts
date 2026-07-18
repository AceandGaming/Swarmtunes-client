export class LoadingText {
    static Attach(element: HTMLElement) {
        if (element.querySelector(".loading-text")) {
            return
        }
        const loading = document.createElement("div")
        loading.classList.add("loading-text")
        element.appendChild(loading)
    }
    static Detach(element: HTMLElement) {
        const text = element.querySelector(".loading-text")
        if (text) {
            text.remove()
        }
    }
}