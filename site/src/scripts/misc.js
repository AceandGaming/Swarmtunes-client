function OnServerResyncButtonClick() {
    Network.ServerResync()
}
function EnsureArray(arrayOrValue) {
    if (Array.isArray(arrayOrValue)) {
        return arrayOrValue
    }
    return [arrayOrValue]
}
function EnsureValue(array) {
    if (array.length === 1) {
        return array[0]
    }
    return array
}
function FormatTime(seconds) {
    if (!isFinite(seconds)) {
        return "0:00"
    }
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
}
function GetidsFromSongList(songs) {
    const ids = []
    for (const song of songs) {
        ids.push(song.id)
    }
    return ids
}
function HasValues(dict, ...args) {
    for (const arg of args) {
        if (!(arg in dict)) {
            return false
        }
    }
    return true
}
function RequireAdmin() {
    if (!Network.IsAdmin()) {
        console.error("User is not admin")
    }
}
function LoadSVG(path) {
    let svg = document.createElement("svg")
    fetch(path).then((response) => {
        response.text().then((text) => {
            text = text.replace(/\swidth=\"\d+\"/g, "").replace(/\sheight=\"\d+\"/g, "").replace(/<!--[\s\S]*?-->/g, "")

            const attributeString = Array.from(svg.attributes)
                .map(attr => `${attr.name}="${attr.value}"`)
                .join(" ");
            text = text.replace(/<svg/g, "<svg " + attributeString)

            svg.outerHTML = text
        })
    })

    return svg
}
function Promiseify(req) {
    return new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
    })
}
function PromiseifyTransaction(tx) {
    return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
        tx.onabort = () => reject(tx.error)
    })
}

async function* CursorIterator(store) {
    let request = store.openCursor();

    while (true) {
        const cursor = await new Promise((resolve, reject) => {
            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => reject(event.target.IDBRequest.error);
        });

        if (!cursor) break;
        yield cursor;
        cursor.continue();
    }
}

function CloneSongs(songs) {
    const newSongs = [];
    for (const song of songs) {
        newSongs.push(song.Copy());
    }
    return newSongs;
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function RGBToHSL(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (delta !== 0) {
        s = delta / (1 - Math.abs(2 * l - 1));

        switch (max) {
            case r:
                h = ((g - b) / delta) % 6;
                break;
            case g:
                h = (b - r) / delta + 2;
                break;
            case b:
                h = (r - g) / delta + 4;
                break;
        }

        h *= 60;
        if (h < 0) h += 360;
    }

    return { h: h, s: s * 100, l: l * 100 };
}