class ErrorScreen {
    constructor(message, retryEvent = null, imagePath = "src/art/neuro-cry.png", buttonText = "Retry") {
        this.message = message
        this.retryEvent = retryEvent
        this.imagePath = imagePath
        this.buttonText = buttonText
    }
    OnRetryButtonClick() {
        this.element.remove()
        this.retryEvent()
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
class LoginRequired extends ErrorScreen {
    constructor(imagePath = "") {
        super("Login required", () => {}, imagePath, "Login")
        LoginPopup.AddLoginCallback(this.OnLogin.bind(this))
    }
    OnRetryButtonClick() {
        LoginPopup.Show()
    }
    OnLogin() {
        this.element.remove()
    }
}