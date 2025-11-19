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
function GetUuidsFromSongList(songs) {
    const uuids = []
    for (const song of songs) {
        uuids.push(song.uuid)
    }
    return uuids
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