import { optimize } from 'svgo/browser'


export function LoadSVG(path) {
    let svg = document.createElement("svg")
    fetch(path).then((response) => {
        const contentType = response.headers.get("content-type") || ""

        if (!contentType.includes("image/svg+xml")) {
            throw new Error("Response is not SVG. src: " + path)
        }

        response.text().then((text) => {
            text = optimize(text).data

            const attributeString = Array.from(svg.attributes)
                .map(attr => `${attr.name}="${attr.value}"`)
                .join(" ")
            text = text.replace(/<svg/g, "<svg " + attributeString)

            svg.outerHTML = text
        })
    })

    return svg
}
export function ListenForInputSubmit(input, action) {
    input.addEventListener("keyup", (event) => {
        if (event.key === "Enter") {
            action()
        }
    })
}