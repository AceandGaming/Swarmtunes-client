class ToastUI extends HTMLElement {
    static get observedAttributes() { return ["message"], ["duration"], ["type"]; }
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) {
            return
        }

        switch (name) {
            case "message":
                this.#message = newValue
                break;
            case "duration":
                this.#duration = newValue
                break;
            case "type":
                this.#type = newValue
                break;
            case "htmlContent":
                this.#htmlContent = newValue
                break;
        }
    }
    #message = "no message"
    #duration = 3 //seconds
    #type = "none"
    #htmlContent = false
    #created = false

    get message() {
        return this.#message
    }
    set message(value) {
        this.setAttribute("message", value);
        this.#message = value
        this.UpdateUI()
    }

    get duration() {
        return this.#duration
    }
    set duration(value) {
        this.setAttribute("duration", value);
        this.#duration = value
    }

    get type() {
        return this.#type
    }
    set type(value) {
        if (!["none", "info", "warning", "error"].includes(value)) {
            console.error("Invalid toast type", value)
            return
        }

        this.setAttribute("type", value);
        this.#type = value
        this.UpdateUI()
    }

    get htmlContent() {
        return this.#htmlContent
    }
    set htmlContent(value) {
        this.setAttribute("htmlContent", value);
        this.#htmlContent = value
    }


    connectedCallback() {
        const shadow = this.attachShadow({ mode: "open" });

        const style = document.createElement("style")
        style.textContent = /*css*/`
            :host {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: right;
                gap: 10px;
                background-color: var(--background-colour);
                color: var(--text-colour);

                flex: 1;
                max-width: 100%;
                min-height: 50px;
                border-radius: 15px;
                border: 1px solid var(--subtext-colour);
                padding: 3px 10px;
            }
            :host img {
                height: 100%;
                aspect-ratio: 1;
            }
            :host span {
                white-space: normal;
                width: 100%;
            }
        `
        shadow.append(style)

        this.icon = document.createElement("img")
        this.text = document.createElement("span")

        shadow.append(this.text, this.icon)

        this.#created = true

        this.UpdateUI()

        this.style.transform = `translateX(calc(100% + 20px))`
        this.getBoundingClientRect() //update
        this.style.transition = `transform 0.3s ease-in-out`
        this.style.transform = `translateX(0)`

        if (this.duration > 0) {
            setTimeout(() => {
                this.Hide()
            }, this.#duration * 1000)
        }

        this.addEventListener("click", () => {
            this.Hide()
        })
    }
    UpdateUI() {
        if (!this.#created) {
            return
        }
        if (this.#type === "none") {
            this.icon.src = ""
        }
        else {
            this.icon.src = `src/assets/icons/${this.#type}.svg`
        }


        if (this.#htmlContent) {
            this.text.innerHTML = this.#message
        }
        else {
            this.text.textContent = this.#message
        }
    }
    Hide() {
        this.style.transform = `translateX(calc(100% + 20px))`
        this.ontransitionend = () => {
            this.remove()
        }
    }
}
customElements.define("swarmtunes-toast", ToastUI);