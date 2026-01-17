class ShareWindow extends PopupWindow {
    constructor(link) {
        super("Copy Link")

        const input = document.createElement("input")
        input.value = link
        input.readOnly = true
        this.content.appendChild(input)

        function copy() {
            const corutine = navigator.clipboard.writeText(link)
            corutine.then(() => {
                ToastManager.Toast("Copied link to clipboard")
            })
            corutine.catch(() => {
                ToastManager.Toast("Failed to copy link to clipboard", "error")
            })
        }
        const copyButton = this.CreateButton("Copy", copy)
        this.buttons.appendChild(copyButton)
    }
}