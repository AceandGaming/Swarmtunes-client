function CreateSongListItemElement(song, onClickEvent, showDate = false, catagory = "song", unavaliable = false) {
    const element = document.createElement("li")
    element.classList.add("song-list-item", "song")
    element.setAttribute("data-id", song.Id)
    element.setAttribute("data-category", catagory)
    element.classList.toggle("unavaliable", unavaliable)
    element.addEventListener("click", onClickEvent)
    element.innerHTML = `
        <cover-img src=${Network.GetCover(song.Cover, 64)}></cover-img>
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
    constructor(songs, songOnClickEvent = OnSongClick, catagory = "song", showDate = true, max = -1) {
        if (songs == undefined || !Array.isArray(songs)) {
            console.error("SongList must be initialized with an array of songs")
            return
        }
        this.songs = songs
        this.songOnClickEvent = songOnClickEvent
        this.catagory = catagory
        this.showDate = showDate
        this.max = max

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
    async Update() {
        this.element.style.display = ""
        this.element.innerHTML = ""
        const avaliableSongs = new Set(await SongRequester.GetAvailableSongs(this.songs.map(s => s.Id)))
        for (const [i, song] of this.songs.entries()) {
            const avaliable = avaliableSongs.has(song.Id)
            this.element.appendChild(CreateSongListItemElement(song, this.songOnClickEvent, this.showDate, this.catagory, !avaliable))
            if (this.max > 0 && i > this.max) {
                break
            }
        }
    }
    UpdateAnimated() {
        const oldBounds = {}
        for (const child of this.element.children) {
            const id = child.getAttribute("data-id")
            oldBounds[id] = child.getBoundingClientRect()
        }

        this.Update()
        if (oldBounds.length === 0) {
            return
        }

        for (const element of this.element.children) {
            const id = element.getAttribute("data-id")
            const oldBound = oldBounds[id]
            if (oldBound === undefined) {
                continue
            }
            const newBound = element.getBoundingClientRect()
            const dy = oldBound.top - newBound.top

            element.style.transform = `translate(0, ${dy}px)`
            element.style.transition = "transform 0"

            element.getBoundingClientRect() //force update. Idk browser are weird

            requestAnimationFrame(() => {
                element.style.transition = "transform 300ms ease";
                element.style.transform = "";
            });
        }
    }
    Hide() {
        this.element.style.display = "none"
    }
    Show() {
        this.element.style.display = ""
    }
}