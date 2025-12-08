class Cover extends HTMLElement {
    src = "";

    connectedCallback() {
        const shadow = this.attachShadow({ mode: "open" });
        const src = this.getAttribute("src")

        const style = document.createElement("style")
        style.textContent = `
            :host {
                position: relative;
                aspect-ratio: 1;
                border-radius: 5%;
                background-color: var(--cover-background);
            }
            img {
                display: block;
                width: 100%;
                height: 100%;
                background-color: inherit;
                border-radius: inherit;
            }
            img.loading {
                opacity: 0;
                position: absolute;
                top: 0;
                left: 0;
            }
        `
        shadow.append(style)

        const placeholder = document.createElement("img")
        placeholder.src = "src/assets/no-song.png"

        const image = document.createElement("img")
        image.classList.add("loading")
        image.crossOrigin = "anonymous"
        image.loading = "lazy"
        image.src = src ?? this.src

        shadow.append(placeholder, image)

        function GetColour() {
            return colourThief.getColor(image)
        }

        image.onload = () => {
            image.classList.remove("loading")
            requestAnimationFrame(() => placeholder.remove())

            this.dispatchEvent(new CustomEvent("onload", {
                detail: {
                    image: image,
                    GetColour: GetColour,
                    GetColor: GetColour
                },
            }))
        }
    }
}
customElements.define("cover-img", Cover);