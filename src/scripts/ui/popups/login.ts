import { ListenForInputSubmit } from "@ts/misc"
import PopupWindow from "@ts/ui/popups/popup"
import { Login, Signup } from "@ts/login.svelte.ts"
import { HttpError } from "@ts/api/network"

function GetFeildOfErrorCode(code: string): "username" | "password" | "all" | "none" | undefined {
    switch (code) {
        case "USERNAME_TOO_SHORT":
            return "username"
        case "USERNAME_TOO_LONG":
            return "username"
        case "INVALID_USERNAME":
            return "username"
        case "PASSWORD_TOO_LONG":
            return "password"
        case "PASSWORD_TOO_SHORT":
            return "password"
        case "PASSWORD_TOO_WEAK":
            return "password"
        case "INVALID_USERNAME_OR_PASSWORD":
            return "all"
        case "ACCOUNT_LIMIT_REACHED":
            return "none"
    }
    return undefined
}

export class LoginPopup extends PopupWindow {
    usernameInput: HTMLInputElement
    passwordInput: HTMLInputElement
    error: HTMLParagraphElement

    private async Submit(func: typeof Login | typeof Signup) {
        try {
            await func(this.usernameInput.value, this.passwordInput.value)
            this.Hide()
        }
        catch (e) {
            console.error(e)
            if (e instanceof HttpError) {
                const error = GetFeildOfErrorCode(e.code)
                if (error) {
                    this.ShowError(e.message, error)
                    return
                }
            }
            this.ShowError("An unknown error occurred")
        }
    }

    private ShowError(message: string, type: "all" | "username" | "password" | "none" = "all") {
        this.error.textContent = message

        this.usernameInput.classList.remove("error")
        this.passwordInput.classList.remove("error")
        if (!message) {
            return
        }
        switch (type) {
            case "all":
                this.usernameInput.classList.add("error")
                this.passwordInput.classList.add("error")
                break
            case "username":
                this.usernameInput.classList.add("error")
                break
            case "password":
                this.passwordInput.classList.add("error")
                break
        }
    }

    private OnPasswordInput() {
        const password = this.passwordInput.value
        if (password.length > 256) {
            this.ShowError("Password too long", "password")
        }
        else if (password.length < 8) {
            this.ShowError("Password too short", "password")
        }
        else {
            this.ShowError("")
        }
    }
    private OnUsernameInput() {
        const username = this.usernameInput.value.trim().toLowerCase()
        if (username.length > 32) {
            this.ShowError("Username too long", "username")
        }
        else if (username.length < 3) {
            this.ShowError("Username too short", "username")
        }
        else if (!(/^[a-z0-9_]+$/.test(username))) {
            this.ShowError("Invalid username", "username")
        }
        else {
            this.ShowError("")
        }
    }

    constructor() {
        super("Login")
        this.window.id = "login"
        this.CreateButton("Signup", () => this.Submit(Signup), false)
        this.CreateButton("Login", () => this.Submit(Login), false)

        this.usernameInput = document.createElement("input")
        this.usernameInput.type = "text"
        this.usernameInput.placeholder = "Username"
        this.usernameInput.autocomplete = "username"
        this.usernameInput.addEventListener("input", () => this.OnUsernameInput())
        ListenForInputSubmit(this.usernameInput, () => this.passwordInput.focus())

        this.passwordInput = document.createElement("input")
        this.passwordInput.type = "password"
        this.passwordInput.placeholder = "Password"
        this.passwordInput.autocomplete = "current-password"
        this.passwordInput.addEventListener("input", () => this.OnPasswordInput())
        ListenForInputSubmit(this.passwordInput, () => this.Submit(Login))

        this.error = document.createElement("p")
        this.error.style.color = "red"
        this.error.style.fontSize = "12px"

        this.content.append(this.usernameInput, this.passwordInput, this.error)
    }
}
const popup = new LoginPopup()
export default popup