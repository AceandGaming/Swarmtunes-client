import Network from "@ts/network"

export function OnServerResyncButtonClick() {
    Network.ServerResync()
}
export function EnsureArray(arrayOrValue) {
    if (Array.isArray(arrayOrValue)) {
        return arrayOrValue
    }
    return [arrayOrValue]
}
export function EnsureValue(array) {
    if (array.length === 1) {
        return array[0]
    }
    return array
}
export function FormatTime(seconds) {
    if (!isFinite(seconds)) {
        return "0:00"
    }
    const absSeconds = Math.abs(seconds)

    const minutes = Math.floor(absSeconds / 60)
    const secs = Math.floor(absSeconds % 60).toString().padStart(2, '0')
    return `${minutes}:${secs}`
}
export function GetidsFromSongList(songs) {
    const ids = []
    for (const song of songs) {
        ids.push(song.id)
    }
    return ids
}
export function HasValues(dict, ...args) {
    for (const arg of args) {
        if (!(arg in dict)) {
            return false
        }
    }
    return true
}
export function RequireAdmin() {
    if (!Network.IsAdmin()) {
        console.error("User is not admin")
    }
}
export function LoadSVG(path) {
    let svg = document.createElement("svg")
    fetch(path).then((response) => {
        const contentType = response.headers.get("content-type") || ""

        if (!contentType.includes("image/svg+xml")) {
            throw new Error("Response is not SVG. src: " + path)
        }

        response.text().then((text) => {
            text = text.replace(/\swidth=\"\d+\"/g, "").replace(/\sheight=\"\d+\"/g, "").replace(/<!--[\s\S]*?-->/g, "")

            const attributeString = Array.from(svg.attributes)
                .map(attr => `${attr.name}="${attr.value}"`)
                .join(" ")
            text = text.replace(/<svg/g, "<svg " + attributeString)

            svg.outerHTML = text
        })
    })

    return svg
}
export function Promiseify(req) {
    return new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
    })
}
export function PromiseifyTransaction(tx) {
    return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
        tx.onabort = () => reject(tx.error)
    })
}

export async function* CursorIterator(store) {
    let request = store.openCursor()

    while (true) {
        const cursor = await new Promise((resolve, reject) => {
            request.onsuccess = (event) => resolve(event.target.result)
            request.onerror = (event) => reject(event.target.IDBRequest.error)
        })

        if (!cursor) break
        yield cursor
        cursor.continue()
    }
}

export function CloneSongs(songs) {
    const newSongs = []
    for (const song of songs) {
        newSongs.push(song.Copy())
    }
    return newSongs
}
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
export function ListenForInputSubmit(input, action) {
    input.addEventListener("keyup", (event) => {
        if (event.key === "Enter") {
            action()
        }
    })
}
export function HslToHex(hsl) {
    const ctx = document.createElement("canvas").getContext("2d")
    ctx.fillStyle = hsl
    return ctx.fillStyle
}