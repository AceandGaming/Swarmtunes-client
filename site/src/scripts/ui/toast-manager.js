class ToastManager {
    static #element

    static Create() {
        this.#element = document.createElement("div")
        this.#element.id = "toast-manager"
        document.body.append(this.#element)
    }
    static AddToast(toast) {
        this.#element.append(toast)
    }
    static Toast(message, type = "none", duration = 3, htmlContent = false) {
        const toast = document.createElement("swarmtunes-toast")
        toast.message = message
        toast.duration = duration
        toast.type = type
        toast.htmlContent = htmlContent
        this.AddToast(toast)
        return toast
    }
}