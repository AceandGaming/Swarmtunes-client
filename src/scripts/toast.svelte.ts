type Toast = {
    id: number
    message: string
    type: "default" | "success" | "failure"
}

const toasts: Toast[] = $state([])

export function GetToasts() {
    return toasts
}

export default {
    Add(message: Toast["message"], type: Toast["type"] = "default", duration: number = 3000) {
        const toast = {
            id: Date.now(),
            message,
            type
        }

        toasts.push(toast)

        setTimeout(() => {
            const i = toasts.findIndex(t => t.id == toast.id)
            if (i == -1) {
                return
            }
            toasts.splice(i, 1)
        }, duration)
    },
    AddPersistent(message: Toast["message"], type: Toast["type"] = "default") {
        const toast = {
            id: Date.now(),
            message,
            type
        }

        toasts.push(toast)

        return () => {
            const i = toasts.findIndex(t => t.id == toast.id)
            if (i == -1) {
                return
            }
            toasts.splice(i, 1)
        }
    }
}