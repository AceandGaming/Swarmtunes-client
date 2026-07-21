import { LoadSVG } from "@ts/misc"

export default abstract class PopupWindow {
    background: HTMLElement
    window: HTMLElement
    title: HTMLElement
    content: HTMLElement
    buttons: HTMLElement

    constructor(title: string) {
        this.background = document.createElement("div")
        this.background.classList.add("popup-background")

        this.window = document.createElement("div")
        this.window.classList.add("popup-window")
        this.background.appendChild(this.window)

        const closeButton = document.createElement("button")
        closeButton.append(LoadSVG("/icons/x.svg"))
        closeButton.classList.add("close-button", "icon-button")
        closeButton.addEventListener("click", this.Hide.bind(this))
        this.window.appendChild(closeButton)

        this.title = document.createElement("h1")
        this.title.textContent = title ?? "Error"
        this.window.appendChild(this.title)

        this.content = document.createElement("div")
        this.content.classList.add("content")
        this.window.appendChild(this.content)

        this.buttons = document.createElement("div")
        this.buttons.classList.add("buttons")
        this.window.appendChild(this.buttons)

        document.body.appendChild(this.background)
    }
    CreateButton(name: string, onClick: (event: any) => void, autoclose = true) {
        const button = document.createElement("button")
        button.addEventListener("click", onClick)
        if (autoclose) {
            button.addEventListener("click", () => this.Hide())
        }
        button.addEventListener("click", () => this.SetBusy())
        button.textContent = name
        this.buttons.appendChild(button)
        return button
    }
    Hide() {
        this.background.style.display = "none"
    }
    Show() {
        this.background.style.display = "flex"
        this.SetBusy(false)
    }
    SetBusy(state = true) {
        this.window.classList.toggle("busy", state)
    }
    Close() {
        this.Hide()
        document.removeChild(this.background)
    }
}