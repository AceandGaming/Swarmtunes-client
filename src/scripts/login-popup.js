function ValidateUsername(username) {
    if (username.length > 32 || username.length <= 0) {
        return {
            error: true,
            message: "Invalid username"
        }
    }
    username = username.trim().toLowerCase()
    if (!/^[a-z0-9_-]+$/.test(username)) {
        return {
            error: true,
            message: "Username contains invalid characters"
        }
    }
    return {
        error: false,
        message: ""
    }
}
function ValidatePassword(password) {
    if (password.length > 32 || password.length <= 0) {
        return {
            error: true,
            message: "Invalid password"
        }
    }
    if (password.length < 5) {
        return {
            error: true,
            message: "Password too short"
        }
    }
    return {
        error: false,
        message: ""
    }
}
class LoginPopup {
    static callbacks = []

    static AddLoginCallback(callback) {
        this.callbacks.push(callback)
    }
    static CallLoginCallbacks() {
        const isAdmin = Network.IsAdmin()
        for (const callback of this.callbacks) {
            callback(isAdmin)
        }
    }
    static AttachInputs() {
        this.background = document.getElementById("login-background")
        this.error = document.getElementById("login-error")

        this.usernameInput = document.getElementById("username-input")
        this.passwordInput = document.getElementById("password-input")

        this.usernameInput.addEventListener("input", LoginPopup.#OnUsernameInput.bind(this))
        this.passwordInput.addEventListener("input", LoginPopup.#OnPasswordInput.bind(this))

        this.boarderColour = CssColours.GetColour("popup-input-boarder")
        this.errorColour = CssColours.GetColour("popup-input-boarder-error")

        const loginButton = document.getElementById("login-button")
        loginButton.addEventListener("click", LoginPopup.#OnLoginButtonClick.bind(this))
        const signupButton = document.getElementById("signup-button")
        signupButton.addEventListener("click", LoginPopup.#OnSignupButtonClick.bind(this))

        const closeButton = document.getElementById("login-close-button")
        closeButton.addEventListener("click", LoginPopup.Hide.bind(this))
    }
    static #OnUsernameInput() {
        const username = this.usernameInput.value
        const result = ValidateUsername(username)
        if (result.error) {
            this.error.textContent = result.message
            this.usernameInput.style.borderColor = this.errorColour
        }
        else {
            this.error.textContent = ""
            this.usernameInput.style.borderColor = this.boarderColour
        }
    }
    static #OnPasswordInput() {
        const password = this.passwordInput.value
        const result = ValidatePassword(password)
        if (result.error) {
            this.error.textContent = result.message
            this.passwordInput.style.borderColor = this.errorColour
        }
        else {
            this.error.textContent = ""
            this.passwordInput.style.borderColor = this.boarderColour
        }
    }
    static #OnLoginButtonClick() {
        const username = this.usernameInput.value
        const password = this.passwordInput.value
        const cor = Network.Login(username, password)
        cor.catch(() => this.error.textContent = "An unknown error occurred")
        cor.then(output => {
            if (output instanceof String) {
                this.error.textContent = output
                return
            }
            this.Hide()
            this.CallLoginCallbacks()
        })
    }
    static #OnSignupButtonClick() {
        const username = this.usernameInput.value
        const password = this.passwordInput.value
        const cor = Network.Register(username, password)
        cor.catch(() => this.error.textContent = "An unknown error occurred")
        cor.then(output => {
            if (output instanceof String) {
                this.error.textContent = output
                return
            }
            this.Hide()
            this.CallLoginCallbacks()
        })
    }
    static Show() {
        this.background.style.display = "flex"
    }
    static Hide() {
        this.background.style.display = "none"
    }
}