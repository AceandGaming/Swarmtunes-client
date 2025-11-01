function AddLoadingImage(element, wrapper, source) {
    const placeholder = document.createElement("img")
    placeholder.classList.add("cover")
    placeholder.src = "src/art/no-song.png"
    wrapper.appendChild(placeholder)

    const image = document.createElement("img")
    image.crossOrigin = "anonymous"
    image.loading = "lazy"
    image.classList.add("loading")
    image.onload = () => {
        image.classList.remove("loading")
        image.classList.add("cover")
        placeholder.remove()
        const colour = colourThief.getColor(image)
        const backgroundDefault = `rgb(${colour[0]}, ${colour[1]}, ${colour[2]})`
        const backgroundHover = `rgb(${colour[0] + 20}, ${colour[1] + 20}, ${colour[2] + 20})`
        element.style.backgroundColor = backgroundDefault
        element.style.borderColor = backgroundDefault

        image.style.backgroundColor = `rgb(${colour[0] - 30}, ${colour[1] - 30}, ${colour[2] - 30})`

        element.addEventListener("mouseenter", () => {
            element.style.backgroundColor = backgroundHover
            element.style.borderColor = backgroundHover
        })
        element.addEventListener("mouseleave", () => {
            element.style.backgroundColor = backgroundDefault
            element.style.borderColor = backgroundDefault
        })
    }
    image.src = source
    wrapper.appendChild(image)
}
function CreateCatagoryItemElement(title, uuid, cover, onClickEvent, type = "") {
    const element = document.createElement("div")
    element.classList.add("catagory-item", type)
    element.title = type
    element.setAttribute("data-uuid", uuid)
    element.setAttribute("onclick", onClickEvent)
    element.setAttribute("data-rightclickcategory", type)

    const wrapper = document.createElement("div")
    const source = Network.GetCoverUrl(cover, 256)
    if (source.startsWith('src')) {
        const image = document.createElement("img")
        image.classList.add("cover")
        image.src = source
        wrapper.appendChild(image)
    }
    else {
        AddLoadingImage(element, wrapper, source)
    }
    element.appendChild(wrapper)

    const span = document.createElement("span")
    span.textContent = title
    element.appendChild(span)

    return element
}

class Catagory {
    constructor(title, items, grid = false) {
        this.title = title
        this.items = items
        this.grid = grid
    }
    CreateElement() {
        const element = document.createElement("div")
        element.classList.add("catagory")
        element.innerHTML = `
            <span class="title">${this.title}</span>
        `
        const wrapper = document.createElement("div")
        wrapper.classList.add("display-wrapper")
        const display = document.createElement("div")
        if (this.grid) {
            display.classList.add("grid")
        }
        display.classList.add("display")

        wrapper.appendChild(display)
        this.AddChildren(display)

        element.appendChild(wrapper)
        return element
    }
    AddChildren(display) {

    }
}
class SongCatagory extends Catagory {
    AddChildren(display) {
        for (const song of this.items) {
            display.appendChild(CreateCatagoryItemElement(song.title, song.uuid, song.uuid, "OnSongClick(event)", "song"))
        }
    }
}
class AlbumCatagory extends Catagory {
    AddChildren(display) {
        for (const album of this.items) {
            if (album.songs.length === 1) {
                const song = album.songs[0]
                display.appendChild(CreateCatagoryItemElement(album.date, album.uuid, song.uuid, "OnAlbumClick(event)", "album"))
            }
            else {
                display.appendChild(CreateCatagoryItemElement(album.date, album.uuid, album.type, "OnAlbumClick(event)", "album"))
            }
        }
    }
}
class PlaylistCatagory extends Catagory {
    AddChildren(display) {
        for (const playlist of this.items) {
            display.appendChild(CreateCatagoryItemElement(playlist.name, playlist.uuid, playlist.cover, "OnPlaylistClick(event)", "playlist"))
        }
    }
}