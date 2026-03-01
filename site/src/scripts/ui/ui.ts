abstract class UIObject extends HTMLElement {
    get element(): HTMLElement { return this }
    get visible(): boolean { return !this.classList.contains("hidden") }

    readonly name: string = ""

    constructor(name?: string) {
        super()
        this.name = name || this.name
        UIManager.AddObject(this)
    }

    public Initialise(mobileLayout: boolean): Promise<void> { return Promise.resolve() }
    public DestroyUI(): void {
        if (!this.element.parentElement) {
            return
        }
        this.element.remove()
    }

    public Show(): void {
        this.element.classList.remove("hidden")
    }
    public Hide(): void {
        this.element.classList.add("hidden")
    }

    connectedCallback() {
        const event = new Event("connected")
        this.dispatchEvent(event)
    }

    public OnLayoutChange(mobileLayout: boolean): void | Promise<void> { }
    public OnLoginChange(isLoggedIn: boolean): void | Promise<void> { }
    public OnConnectionChange(isOnline: boolean): void | Promise<void> { }
    public OnUILoadFailed(): void {
        console.error("UI element failed to load: ", this)
    }
}
class UIManager {
    private static uiObjects: UIObject[] = []

    public static AddObject(object: UIObject) {
        this.uiObjects.push(object)

        object.addEventListener("connected", () => {
            const promise = object.Initialise(false)
            promise.catch((error) => {
                console.error(error)
                object.OnUILoadFailed()
            })
        })
    }
}