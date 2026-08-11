import { ListenForInputSubmit } from "@ts/misc"
import PopupWindow from "@ts/ui/popups/popup"
import ToastManager from "@ts/ui/toast-manager"
import { Login as NetLogin, Signup as NetSignup, GetMe } from "@ts/api/auth"

function ValidateUsername(username: string) {
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
function ValidatePassword(password: string) {
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
export class Login {
    static callbacks: ((state: boolean) => void)[] = []
    static usernameInput: HTMLInputElement
    static passwordInput: HTMLInputElement
    static error: HTMLElement
    static window: LoginPopup

    static AddLoginCallback(callback: (state: boolean) => void) {
        this.callbacks.push(callback)
    }
    static CallLoginCallbacks(isAdmin: boolean = false) {
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
        const cor = NetLogin(username, password)
        cor.catch((e) => { this.window.SetBusy(false); this.error.textContent = e.message })
        cor.then(user => {
            this.window.Hide()
            this.CallLoginCallbacks(user.role === "admin")
            ToastManager.Toast("Logged in as " + username)
        })
    }
    static #OnSignupButtonClick() {
        const username = this.usernameInput.value
        const password = this.passwordInput.value
        const cor = NetSignup(username, password)
        cor.catch((e) => { this.window.SetBusy(false); this.error.textContent = e.message })
        cor.then(user => {
            this.window.Hide()
            this.CallLoginCallbacks(user.role === "admin")
            ToastManager.Toast("Logged in as " + username)
        })
    }

    static async CheckLogin() {
        console.log("Checking login")
        try {
            const user = await GetMe()
            console.log("Logged in", user)
            this.CallLoginCallbacks(user.role === "admin")
        }
        catch { console.log("Not logged in") }
    }
}
export class LoginPopup extends PopupWindow {
    usernameInput: HTMLInputElement
    passwordInput: HTMLInputElement
    error: HTMLParagraphElement

    constructor(OnLoginCallback: () => void, OnSignupCallback: () => void, OnUsernameInput: () => void, OnPasswordInput: () => void) {
        super("Login")
        this.window.id = "login"
        this.CreateButton("Signup", OnSignupCallback, false)
        this.CreateButton("Login", OnLoginCallback, false)

        this.passwordInput = document.createElement("input")
        this.passwordInput.type = "password"
        this.passwordInput.placeholder = "Password"
        this.passwordInput.autocomplete = "current-password"
        this.passwordInput.addEventListener("input", OnPasswordInput.bind(this))
        ListenForInputSubmit(this.passwordInput, OnLoginCallback.bind(this))

        this.usernameInput = document.createElement("input")
        this.usernameInput.type = "text"
        this.usernameInput.placeholder = "Username"
        this.usernameInput.autocomplete = "username"
        this.usernameInput.addEventListener("input", OnUsernameInput.bind(this))
        ListenForInputSubmit(this.usernameInput, this.passwordInput.focus.bind(this.passwordInput))

        this.content.append(this.usernameInput, this.passwordInput)

        this.error = document.createElement("p")
        this.error.style.color = "red"
        this.error.style.fontSize = "12px"
        this.content.appendChild(this.error)
    }
}

window.Login = Login