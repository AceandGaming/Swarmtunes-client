function CreateCatagoryItemImage(element, source, title) {
    const image = document.createElement("cover-img")
    image.src = source

    image.addEventListener("onload", (event) => {

        const colour = event.detail.GetColour()

        let backgroundDefault = `rgb(${colour[0] - 20}, ${colour[1] - 20}, ${colour[2] - 20})`
        let backgroundHover = `rgb(${colour[0]}, ${colour[1]}, ${colour[2]})`
        if (colour[0] > 220) {
            backgroundDefault = `rgb(${colour[0] - 100}, ${colour[1] - 100}, ${colour[2] - 100})`
            backgroundHover = `rgb(${colour[0] - 70}, ${colour[1] - 70}, ${colour[2] - 70})`
        }
        element.style.backgroundColor = backgroundDefault
        element.style.borderColor = backgroundDefault

        image.style.backgroundColor = `rgb(${colour[0] - 50}, ${colour[1] - 50}, ${colour[2] - 50})`


        element.addEventListener("mouseenter", () => {
            element.style.backgroundColor = backgroundHover
            element.style.borderColor = backgroundHover
        })
        element.addEventListener("mouseleave", () => {
            element.style.backgroundColor = backgroundDefault
            element.style.borderColor = backgroundDefault
        })
    })
    image.src = source
    return image
}
function CreateCatagoryItemElement(title, id, imageSource, onClickEvent, type, overlay = "", overlayHover = "") {
    const element = document.createElement("div")
    element.classList.add("catagory-item", type)
    element.setAttribute("data-id", id)
    element.setAttribute("onclick", onClickEvent)
    element.setAttribute("data-category", type)

    const wrapper = document.createElement("div")
    wrapper.append(CreateCatagoryItemImage(element, imageSource))

    if (overlay) {
        const overlayContainer = document.createElement("span")
        overlayContainer.classList.add("overlay")

        const overlayElement = document.createElement("div")
        overlayElement.innerHTML = overlay
        const overlayHoverElement = document.createElement("div")
        overlayHoverElement.classList.add("hover")
        overlayHoverElement.innerHTML = overlayHover

        overlayContainer.append(overlayElement, overlayHoverElement)

        wrapper.appendChild(overlayContainer)
    }


    element.appendChild(wrapper)

    const span = document.createElement("span")
    span.innerHTML = ReplaceEmotesOfString(title)
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

        wrapper.addEventListener("scroll", () => {
            CheckCatagoryOverflow(element, wrapper)
        })
        setTimeout(() => {
            CheckCatagoryOverflow(element, wrapper)
        }, 200)
        return element
    }
    AddChildren(display) {

    }
}
class SongCatagory extends Catagory {
    AddChildren(display) {
        for (const song of this.items) {
            display.appendChild(CreateCatagoryItemElement(
                song.Title,
                song.Id,
                Network.GetCover(song.Cover, 256),
                "OnSongClick(event)",
                "song",
                `<img src="src/assets/icons/note.png">`,
                "Song"
            ))
        }
    }
}
class AlbumCatagory extends Catagory {
    AddChildren(display) {
        for (const album of this.items) {
            display.appendChild(CreateCatagoryItemElement(
                album.PrettyDate,
                album.Id,
                Network.GetCover(album.Cover, 256),
                "OnAlbumClick(event)",
                "album",
                `<img src="src/assets/icons/disc.svg">`,
                "Album"
            ))
        }
    }
}
class PlaylistCatagory extends Catagory {
    AddChildren(display) {
        for (const playlist of this.items) {
            const element = CreateCatagoryItemElement(
                playlist.Title,
                playlist.Id,
                Network.GetCover(playlist.Cover, 256),
                "OnPlaylistClick(event)",
                "playlist",
                `<img src="src/assets/icons/playlist.svg">`,
                "Playlist"
            )

            const renameButton = document.createElement("button")
            renameButton.classList.add("rename-button")
            renameButton.onclick = (event) => {
                RenamePlaylistPopup.instance.Show(playlist.Id)
                event.stopPropagation()
            }
            renameButton.title = "Rename Playlist"
            element.appendChild(renameButton)
            display.appendChild(element)
        }
    }
}
function ResizeGridDisplay(grid) {
    const parentWidth = grid.parentElement.offsetWidth
    if (!grid.checkVisibility()) {
        return
    }
    if (parentWidth <= 0) {
        return
    }

    if (grid.children.length === 0) {
        grid.style.width = "0"
        return
    }

    const gap = parseFloat(getComputedStyle(grid).gap) || 0;

    const childWdith = grid.children[0].offsetWidth + gap
    let childrenPerRow = Math.max(Math.floor(parentWidth / childWdith), 1)
    childrenPerRow = Math.min(childrenPerRow, grid.children.length)

    const width = childrenPerRow * childWdith + gap + 2 //margin because js isn't instant
    grid.style.width = `${width}px`
}
function CheckCatagoryOverflow(catagory, wrapper) {
    catagory.classList.toggle("overflowing", wrapper.scrollWidth > wrapper.offsetWidth + wrapper.scrollLeft)
}
function ResizeAllGridDisplays() {
    const grids = document.querySelectorAll(".grid")
    for (const grid of grids) {
        ResizeGridDisplay(grid)
    }
}
window.addEventListener('resize', ResizeAllGridDisplays);