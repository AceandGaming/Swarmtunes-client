function CreateSongListItemElement(song, onClickEvent, showDate = false, catagory = "song") {
    const element = document.createElement("li")
    element.classList.add("song-list-item", "song")
    element.setAttribute("data-uuid", song.uuid)
    element.setAttribute("data-rightclickcategory", catagory)
    element.addEventListener("click", onClickEvent)
    element.innerHTML = `
        <img loading="lazy" class="cover" src=${song.CoverUrl(64)}>
        <div class="title-artist">
            <span>${song.title}</span>
            <span class="sub-text">${song.artist}</span>
        </div>
    `
    if (showDate) {
        element.innerHTML += `<span class="sub-text date">${song.prettyDate}</span>`
    }
    return element
}
class SongList {
    constructor(songs, songOnClickEvent = OnSongClick, catagory = "song") {
        if (songs == undefined || !Array.isArray(songs)) {
            console.error("SongList must be initialized with an array of songs")
            return
        }
        this.songs = songs
        this.songOnClickEvent = songOnClickEvent
        this.catagory = catagory
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
    CreateElement(showDate = false) {
        const element = document.createElement("ol")
        element.classList.add("song-list")
        for (const song of this.songs) {
            element.appendChild(CreateSongListItemElement(song, this.songOnClickEvent, showDate, this.catagory))
        }
        return element
    }
}