class ContextOption {
    constructor(
        public name: string,
        public icon: string,
        private action: (prams: any) => void,
    ) { }

    Element(prams: any) {
        const element = document.createElement("div")
        element.classList.add("context-option")

        const text = document.createElement("span")
        text.textContent = this.name
        element.append(text)

        if (this.icon) {
            const icon = LoadSVG(this.icon)
            element.append(icon)
        }

        element.addEventListener("mousedown", () => this.action(prams))
        return element
    }

}

class ContextGroup {

    constructor(
        public name: string,
        public accountRequired: boolean,
        public internetRequired: boolean,
        public options: ContextOption[]
    ) { }
}

class ContextMenu {
    private static categories: { [name: string]: ContextGroup[] } = {}
    private static menu: ContextMenuUI

    public static Initalise() {
        if (isMobile) {
            this.menu = new MobileContextMenu()

            document.addEventListener("contextmenu", (event) => {
                event.preventDefault()
                event.stopPropagation()
            }, { passive: false })

            let timer: any
            const HOLD_TIME = 500
            document.addEventListener("touchstart", (event) => {
                timer = setTimeout(() => {
                    this.OnRightClick(event)
                }, HOLD_TIME)
            }, { passive: false })

            document.addEventListener("touchend", () => {
                clearTimeout(timer)
                //@ts-ignore
                this.menu.AllowTouch()
            })
        }
        else {
            this.menu = new DesktopContextMenu()
            document.addEventListener("contextmenu", this.OnRightClick.bind(this))
        }
    }
    public static OnRightClick(event: MouseEvent | TouchEvent) {
        event.preventDefault()
        event.stopPropagation()


        if (!(event.target instanceof HTMLElement)) {
            console.warn("No target found when opening context menu")
            return
        }
        const category = event.target.dataset.category
        if (category === undefined || this.categories[category] === undefined) {
            return
        }

        this.menu.Populate(this.categories[category], event)
        if (event) {
            this.menu.Show()
        }
    }
    public static AddCategory(name: string, groups: ContextGroup[]) {
        this.categories[name] = groups
    }
    public static InheritCategory(name: string, inherited: string, groups: ContextGroup[]) {
        const inheritedGroups = this.categories[inherited]
        if (!inheritedGroups) {
            throw new Error(`Inherited category ${inherited} does not exist`)
        }

        const map: Record<string, ContextGroup> = {}

        for (const group of inheritedGroups) {
            map[group.name] = {
                name: group.name,
                options: [...group.options],
                accountRequired: group.accountRequired,
                internetRequired: group.internetRequired
            }
        }

        for (const group of groups) {
            if (map[group.name] !== undefined) {
                map[group.name]?.options.push(...group.options)
            }
            else {
                map[group.name] = {
                    name: group.name,
                    options: [...group.options],
                    accountRequired: group.accountRequired,
                    internetRequired: group.internetRequired
                }
            }
        }

        this.categories[name] = Object.values(map)
    }

}

abstract class ContextMenuUI {
    public abstract Populate(groups: ContextGroup[], event: MouseEvent | TouchEvent): void
    public abstract Show(): void
    public abstract Hide(): void
}

class DesktopContextMenu extends ContextMenuUI {
    private element: HTMLDivElement
    private x: number = 0
    private y: number = 0

    constructor() {
        super()
        this.element = document.createElement("div")
        this.element.id = "context-menu"
        this.element.classList.add("desktop")

        document.addEventListener("mousedown", (event) => {
            const target = event.target as HTMLElement
            if (!this.element.contains(target)) {
                this.Hide()
            }
        })

        document.body.append(this.element)
    }
    public Populate(groups: ContextGroup[], event: MouseEvent) {
        if (!(event.target instanceof HTMLElement)) {
            return
        }

        const id = event.target.dataset.id
        const data = {
            id,
            x: event.clientX,
            y: event.clientY,
            object: event.target,
        }
        this.x = event.clientX
        this.y = event.clientY
        this.element.innerHTML = ""

        for (const [i, group] of groups.entries()) {
            if (group.internetRequired && !Network.IsOnline()) {
                continue
            }
            if (group.accountRequired && !Network.IsLoggedIn()) {
                continue
            }
            for (const option of group.options) {
                const child = option.Element(data)
                child.onclick = this.Hide.bind(this)
                this.element.append(child)
            }
            const hr = document.createElement("hr")
            this.element.append(hr)
        }
        const last = this.element.children[this.element.children.length - 1]
        if (last instanceof HTMLHRElement) {
            last.remove()
        }
    }
    public Show() {
        this.element.style.left = `${this.x}px`
        this.element.style.top = `${this.y}px`

        this.element.classList.remove("show")
        this.element.getBoundingClientRect()
        this.element.classList.add("show")
    }
    public Hide() {
        this.element.classList.remove("show")
    }
}
class MobileContextMenu extends ContextMenuUI {
    private element: HTMLDivElement
    private interactable: boolean = false

    constructor() {
        super()
        this.element = document.createElement("div")
        this.element.id = "context-menu"
        this.element.classList.add("mobile")

        document.addEventListener("touchstart", (event) => {
            const target = event.target as HTMLElement
            if (!this.element.contains(target)) {
                this.Hide()
            }
        })

        document.body.append(this.element)
    }
    public Populate(groups: ContextGroup[], event: TouchEvent) {
        if (!(event.target instanceof HTMLElement)) {
            return
        }

        const id = event.target.dataset.id

        const touches = event.changedTouches
        const firstTouch = touches[0]
        const lastTouch = touches[touches.length - 1]

        if (lastTouch === undefined || firstTouch === undefined) {
            return
        }
        const data = {
            id,
            x: lastTouch.clientX,
            y: lastTouch.clientY,
            object: event.target,
        }
        this.element.innerHTML = ""

        for (const [i, group] of groups.entries()) {
            if (group.internetRequired && !Network.IsOnline()) {
                continue
            }
            if (group.accountRequired && !Network.IsLoggedIn()) {
                continue
            }
            for (const option of group.options) {
                const child = option.Element(data)
                child.addEventListener("click", (event) => {
                    if (this.interactable) {
                        this.Hide()
                    }
                })
                this.element.append(child)
            }
            const hr = document.createElement("hr")
            this.element.append(hr)
        }
        const last = this.element.children[this.element.children.length - 1]
        if (last instanceof HTMLHRElement) {
            last.remove()
        }
    }
    public AllowTouch() {
        this.interactable = true
    }
    public Show() {
        this.interactable = false
        this.element.classList.remove("show")
        this.element.getBoundingClientRect()
        this.element.classList.add("show")
    }
    public Hide() {
        this.element.classList.remove("show")
    }
}