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
class Login {
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

    static CreateWindow() {
        this.window = new LoginPopup(
            this.#OnLoginButtonClick.bind(this),
            this.#OnSignupButtonClick.bind(this),
            this.#OnUsernameInput.bind(this),
            this.#OnPasswordInput.bind(this)
        )
        this.passwordInput = this.window.passwordInput
        this.usernameInput = this.window.usernameInput
        this.error = this.window.error
        this.remeberMeToggle = this.window.remeberMeToggle
    }
    static Show() {
        if (!this.window) {
            this.CreateWindow()
        }
        this.window.Show()
    }

    static #OnUsernameInput() {
        const username = this.usernameInput.value
        const result = ValidateUsername(username)
        if (result.error) {
            this.error.textContent = result.message
            this.usernameInput.classList.add("error")
        }
        else {
            this.error.textContent = ""
            this.usernameInput.classList.remove("error")
        }
    }
    static #OnPasswordInput() {
        const password = this.passwordInput.value
        const result = ValidatePassword(password)
        if (result.error) {
            this.error.textContent = result.message
            this.passwordInput.classList.add("error")
        }
        else {
            this.error.textContent = ""
            this.passwordInput.classList.remove("error")
        }
    }
    static #OnLoginButtonClick() {
        const username = this.usernameInput.value
        const password = this.passwordInput.value
        const remeber = this.remeberMeToggle.checked
        const cor = Network.Login(username, password, remeber)
        cor.catch(() => this.error.textContent = "An unknown error occurred")
        cor.then(output => {
            if (typeof output === "string") {
                this.error.textContent = output
                return
            }
            this.window.Hide()
            this.CallLoginCallbacks()
        })
    }
    static #OnSignupButtonClick() {
        const username = this.usernameInput.value
        const password = this.passwordInput.value
        const remeber = this.remeberMeToggle.checked
        const cor = Network.Register(username, password, remeber)
        cor.catch(() => this.error.textContent = "An unknown error occurred")
        cor.then(output => {
            if (typeof output === "string") {
                this.error.textContent = output
                return
            }
            this.window.Hide()
            this.CallLoginCallbacks()
        })
    }
}
class LoginPopup extends PopupWindow {
    constructor(OnLoginCallback, OnSignupCallback, OnUsernameInput, OnPasswordInput) {
        super("Login")
        this.window.id = "login"
        this.CreateButton("Signup", OnSignupCallback, false)
        this.CreateButton("Login", OnLoginCallback, false)

        this.usernameInput = document.createElement("input")
        this.usernameInput.type = "text"
        this.usernameInput.placeholder = "Username"
        this.usernameInput.autocomplete = "username"
        this.usernameInput.addEventListener("input", OnUsernameInput.bind(this))
        this.content.appendChild(this.usernameInput)

        this.passwordInput = document.createElement("input")
        this.passwordInput.type = "password"
        this.passwordInput.placeholder = "Password"
        this.passwordInput.autocomplete = "current-password"
        this.passwordInput.addEventListener("input", OnPasswordInput.bind(this))
        this.content.appendChild(this.passwordInput)

        this.remeberMeLabel = document.createElement("label")
        this.remeberMeLabel.textContent = "Remeber me"

        this.remeberMeToggle = document.createElement("input")
        this.remeberMeToggle.type = "checkbox"
        this.remeberMeLabel.prepend(this.remeberMeToggle)

        this.content.appendChild(this.remeberMeLabel)

        this.error = document.createElement("p")
        this.error.style.color = "red"
        this.error.style.fontSize = "12px"
        this.content.appendChild(this.error)
    }
}