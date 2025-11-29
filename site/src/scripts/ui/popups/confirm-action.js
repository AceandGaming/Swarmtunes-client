class ConfirmAction extends PopupWindow {
    static instance
    static AskUser(displayMessage) {
        return new Promise((resolve, reject) => {
            new ConfirmAction(displayMessage)
            ConfirmAction.instance.window.querySelector(".cancel-button").addEventListener("click", () => {
                resolve(false)
            })
            ConfirmAction.instance.window.querySelector(".confirm-button").addEventListener("click", () => {
                resolve(true)
            })
            ConfirmAction.instance.window.querySelector(".close-button").addEventListener("click", () => {
                resolve(false)
            })
            ConfirmAction.instance.Show()
        })
    }
    constructor(displayMessage) {
        super("Are you sure?")
        const discription = document.createElement("p")
        discription.innerHTML = displayMessage
        this.content.appendChild(discription)

        const cancel = this.CreateButton("Cancel", this.Hide.bind(this))
        cancel.classList.add("cancel-button")
        const confirm = this.CreateButton("Confirm", this.Hide.bind(this))
        confirm.classList.add("confirm-button")

        ConfirmAction.instance = this
    }
}