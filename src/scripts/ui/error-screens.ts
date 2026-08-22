import { OnLogin } from "@ts/login.svelte.ts"
import { ShowLogin } from "@ts/ui/popup.svelte.ts"

export default class ErrorScreen {
    element!: HTMLElement
    message: string
    retryEvent?: () => void
    imagePath: string
    buttonText: string

    constructor(message: string, retryEvent?: () => void, imagePath = "/emotes/neuro-cry.png", buttonText = "Retry") {
        this.message = message
        this.retryEvent = retryEvent
        this.imagePath = imagePath
        this.buttonText = buttonText
    }
    OnRetryButtonClick() {
        this.element.remove()
        this.retryEvent?.()
    }
    CreateElement() {
        const element = document.createElement("div")
        element.classList.add("error-screen")

        const image = document.createElement("img")
        image.src = this.imagePath

        const text = document.createElement("span")
        text.textContent = this.message

        element.append(image, text)

        if (this.retryEvent) {
            const button = document.createElement("button")
            button.textContent = this.buttonText
            button.addEventListener("click", this.OnRetryButtonClick.bind(this))
            element.append(button)
        }
        this.element = element
        return element
    }
}
export class LoginRequired extends ErrorScreen {
    constructor(imagePath = "") {
        super("Login required", ShowLogin, imagePath, "Login")
        OnLogin((user) => {
            if (user) {
                this.element.remove()
            }
        })
    }
    OnRetryButtonClick() {
        ShowLogin()
    }
}
export class LoadingError extends ErrorScreen {
    constructor() {
        super("Error while loading content", () => { document.location.reload() })
    }
}