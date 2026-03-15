export class ToastManager {
    static #element: HTMLElement

    static Create() {
        this.#element = document.createElement("div")
        this.#element.id = "toast-manager"
        document.body.append(this.#element)
    }
    static AddToast(toast: ToastUI) {
        this.#element.append(toast)
    }
    static Toast(message: string, type: "none" | "info" | "warning" | "error" = "none", duration = 3, htmlContent = false): ToastUI {
        const toast = document.createElement("st-toast") as ToastUI
        toast.message = message
        toast.duration = duration
        toast.type = type
        toast.htmlContent = htmlContent
        this.AddToast(toast)
        return toast
    }
}