abstract class UIObject extends HTMLElement {
    get element(): HTMLElement { return this }
    get visible(): boolean { return this.classList.contains("show") }

    readonly name: string = ""

    constructor(name?: string) {
        super()
        this.name = name || this.name
        UIManager.AddObject(this)
    }

    public Initialise(isMobile: boolean): Promise<void> { return Promise.resolve() }
    public DestroyUI(): void {
        if (!this.element.parentElement) {
            return
        }
        this.element.remove()
    }

    public Show(): void {
        this.element.classList.add("show")
    }
    public Hide(): void {
        this.element.classList.remove("show")
    }

    public OnLayoutChange(isMobile: boolean): void | Promise<void> { }
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
        const promise = object.Initialise(false)
        promise.catch((error) => {
            console.error(error)
            object.OnUILoadFailed()
        })
    }
}