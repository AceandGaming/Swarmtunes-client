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
        sizes: {
            innerWidth: window.innerWidth,
            clientWidth: document.documentElement.clientWidth,
            innerHeight: window.innerHeight,
            clientHeight: document.documentElement.clientHeight
        },

        dpr: window.devicePixelRatio,
        userAgent: navigator.userAgent,

        isFullscreen: document.fullscreenElement != null,
        isMobile: window.isMobile,

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