import { optimize } from 'svgo/browser'
import { quintOut } from 'svelte/easing'
import type { AnimationConfig, FlipParams } from 'svelte/animate'

export function LoadSVG(path: string) {
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
export function ListenForInputSubmit(input: HTMLInputElement, action: () => void) {
    input.addEventListener("keyup", (event) => {
        if (event.key === "Enter") {
            action()
        }
    })
}

export function flipNoScale(node: Element, { from, to }: { from: DOMRect; to: DOMRect }, params: FlipParams = {}): AnimationConfig {
    const dx = from.left - to.left
    const dy = from.top - to.top

    const d = Math.sqrt(dx * dx + dy * dy)

    return {
        delay: params.delay ?? 0,
        duration:
            typeof params.duration === 'function'
                ? params.duration(d)
                : params.duration ?? d * 120,
        easing: params.easing ?? quintOut,

        css: (t, u) => `
            transform: translate(${u * dx}px, ${u * dy}px);
        `
    }
}