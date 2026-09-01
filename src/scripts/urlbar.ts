export function ClearUrlBar() {
    window.history.replaceState({}, document.title, window.location.pathname)
}
function GetUrlPrams() {
    const params = new URLSearchParams(window.location.search)
    return params
}

export function GetSongId() {
    const params = GetUrlPrams()
    return params.get("song")
}