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

        element.addEventListener("click", () => this.action(prams))
        return element
    }

}

class ContextGroup {

    constructor(
        public name: string,
        public accountRequired: boolean,
        public options: ContextOption[]
    ) { }
}

class ContextMenu {
    private static categories: { [name: string]: ContextGroup[] } = {}
    private static menu: ContextMenuUI

    public static Initalise() {
        if (isMobile) {
            this.menu = new MobileContextMenu()

            let timer: any;
            const HOLD_TIME = 500;
            document.addEventListener("touchstart", (event) => {
                timer = setTimeout(() => {
                    this.OnRightClick(event);
                }, HOLD_TIME);
            }, { passive: false });
            document.addEventListener("touchend", () => {
                clearTimeout(timer);
            });
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
        const inheritedGroups = this.categories[inherited];
        if (!inheritedGroups) {
            throw new Error(`Inherited category ${inherited} does not exist`);
        }

        const map: Record<string, ContextGroup> = {};

        for (const group of inheritedGroups) {
            map[group.name] = {
                name: group.name,
                options: [...group.options],
                accountRequired: group.accountRequired
            };
        }

        for (const group of groups) {
            if (map[group.name] !== undefined) {
                // @ts-ignore
                map[group.name].options.push(...group.options);
            }
            else {
                map[group.name] = {
                    name: group.name,
                    options: [...group.options],
                    accountRequired: group.accountRequired
                };
            }
        }

        this.categories[name] = Object.values(map);
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

        this.element.onclick = this.Hide.bind(this)
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
            if (group.accountRequired && !Network.IsLoggedIn()) {
                continue
            }
            for (const option of group.options) {
                this.element.append(option.Element(data))
            }
            if (i < groups.length - 1) {
                const hr = document.createElement("hr")
                this.element.append(hr)
            }
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

    constructor() {
        super()
        this.element = document.createElement("div")
        this.element.id = "context-menu"
        this.element.classList.add("mobile")

        this.element.onclick = this.Hide.bind(this)
        document.addEventListener("touchend", (event) => {
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
            if (group.accountRequired && !Network.IsLoggedIn()) {
                continue
            }
            for (const option of group.options) {
                this.element.append(option.Element(data))
            }
            if (i < groups.length - 1) {
                const hr = document.createElement("hr")
                this.element.append(hr)
            }
        }
    }
    public Show() {
        this.element.classList.remove("show")
        this.element.getBoundingClientRect()
        this.element.classList.add("show")
    }
    public Hide() {
        this.element.classList.remove("show")
    }
}