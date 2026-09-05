const logs: string[] = []

for (const method of ["log", "info", "warn", "error", "debug"]) {
    // @ts-ignore
    const original = console[method]

    // @ts-ignore
    console[method] = (...args: any[]) => {
        logs.push(
            `[${method}] ` +
            args.map(x =>
                typeof x === "object" ? JSON.stringify(x) : String(x)
            ).join(" ")
        )

        original.apply(console, args)
    }
}

function CreateLog() {
    const log = logs.join("\n")
    logs.length = 0
    return log
}
function GetDebugInfo() {
    return {
        userAgent: navigator.userAgent,

        sizes: {
            innerWidth: window.innerWidth,
            outerWidth: window.outerWidth,
            clientWidth: document.documentElement.clientWidth,
            visualWidth: window.visualViewport?.width,
            screenWidth: screen.width,
            scrollWidth: document.documentElement.scrollWidth,
            innerHeight: window.innerHeight,
            outerHeight: window.outerHeight,
            clientHeight: document.documentElement.clientHeight,
            visualHeight: window.visualViewport?.height,
            screenHeight: screen.height,
            scrollHeight: document.documentElement.scrollHeight,
        },

        dpr: window.devicePixelRatio,
        scale: window.visualViewport?.scale,
        visualScale: window.visualViewport?.scale,

        isFullscreen: document.fullscreenElement != null,
        isMobile: window.isMobile,
        orientation: screen.orientation?.type,

        features: {
            pointer: window.matchMedia("(pointer: coarse)").matches,
            mediaSession: "mediaSession" in navigator,
            mediaMetadata: "MediaMetadata" in window,
            serviceWorker: "serviceWorker" in navigator,
            indexedDB: "indexedDB" in window
        }
    }
}
export async function CreateDebugDump() {
    return `---DEBUG INFO---\n${JSON.stringify(GetDebugInfo())}\n\n---LOGS---\n${CreateLog()}`.trim()
}