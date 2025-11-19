function CreateSongListItemElement(song, onClickEvent, showDate = false, catagory = "song") {
    const element = document.createElement("li")
    element.classList.add("song-list-item", "song")
    element.setAttribute("data-uuid", song.Id)
    element.setAttribute("data-rightclickcategory", catagory)
    element.addEventListener("click", onClickEvent)
    element.innerHTML = `
        <img loading="lazy" class="cover" src=${Network.GetCover(song.Cover, 64)}>
        <div class="title-artist">
            <span>${song.Title}</span>
            <span class="sub-text">${song.Artist}</span>
        </div>
    `
    if (showDate) {
        element.innerHTML += `<span class="sub-text date">${song.PrettyDate}</span>`
    }
    return element
}
class SongList {
    constructor(songs, songOnClickEvent = OnSongClick, catagory = "song", showDate = true) {
        if (songs == undefined || !Array.isArray(songs)) {
            console.error("SongList must be initialized with an array of songs")
            return
        }
        this.songs = songs
        this.songOnClickEvent = songOnClickEvent
        this.catagory = catagory
        this.showDate = showDate

        this.element = document.createElement("ol")
        this.element.classList.add("song-list")
    }
    SortByTitle() {
        this.songs.sort((a, b) => a.title.localeCompare(b.title))
    }
    SortByDate() {
        this.songs.sort((a, b) => b.jsDate - a.jsDate)
    }
    SortByTitleDifference(title) {
        const titleLen = title.length
        this.songs.sort((a, b) => {
            const aDistance = a.title.length - titleLen
            const bDistance = b.title.length - titleLen
            return aDistance - bDistance
        })
    }
    /** @deprecated */
    CreateElement(showDate = false) {
        this.showDate = showDate
        this.Update()
        return this.element
    }
    Update() {
        this.element.style.display = ""
        this.element.innerHTML = ""
        for (const song of this.songs) {
            this.element.appendChild(CreateSongListItemElement(song, this.songOnClickEvent, this.showDate, this.catagory))
        }
    }
    Hide() {
        this.element.style.display = "none"
    }
    Show() {
        this.element.style.display = ""
    }
}