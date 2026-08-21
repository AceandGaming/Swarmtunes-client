export function MobileHold(element: HTMLElement, onHold: (e: TouchEvent) => void, holdSeconds = 0.5) {
    let timeout: ReturnType<typeof setTimeout> | undefined
    let startPos: { x: number, y: number } | undefined
    let active = false

    function TouchStart(e: TouchEvent) {
        active = false
        timeout = setTimeout(() => {
            e.stopPropagation()
            active = true
            onHold(e)

        }, holdSeconds * 1000)
        startPos = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    function Clear() {
        if (timeout) {
            clearTimeout(timeout)
        }
        timeout = undefined
        startPos = undefined
    }
    function TouchMove(e: TouchEvent) {
        if (!startPos) {
            return
        }
        let x = e.touches[0].clientX
        let y = e.touches[0].clientY

        let distance = Math.sqrt((x - startPos.x) ** 2 + (y - startPos.y) ** 2)
        if (distance > 10) {
            Clear()
        }
    }

    element.addEventListener("touchstart", TouchStart)
    element.addEventListener("touchend", (e) => {
        if (active) {
            e.stopPropagation()
            e.preventDefault()
        }
        Clear()
    })
    element.addEventListener("touchcancel", Clear)
    element.addEventListener("touchmove", TouchMove)

    return () => {
        element.removeEventListener("touchstart", TouchStart)
        element.removeEventListener("touchend", Clear)
        element.removeEventListener("touchcancel", Clear)
        element.removeEventListener("touchmove", TouchMove)
    }
}

export function MobileHoldSvelte(onHold: (e: TouchEvent) => void, holdSeconds = 0.5) {
    return (element: HTMLElement) => {
        const cleanup = MobileHold(element, onHold, holdSeconds)
        return cleanup
    }
}