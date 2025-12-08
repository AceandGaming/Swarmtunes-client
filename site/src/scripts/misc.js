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
function CloneSongs(songs) {
    const newSongs = [];
    for (const song of songs) {
        newSongs.push(song.Copy());
    }
    return newSongs;
}
