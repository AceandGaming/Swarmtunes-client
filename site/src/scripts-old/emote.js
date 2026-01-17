function ReplaceEmotesOfString(text) {
    const container = document.createDocumentFragment()
    const parts = text.split(/(:[a-zA-Z0-9]+)/g)

    for (let part of parts) {
        if (/^:[a-zA-Z0-9]+$/.test(part)) {
            const emote = document.createElement("img")
            emote.src = Network.GetEmoteUrl(part.slice(1))
            emote.alt = part
            emote.className = "emote"
            container.appendChild(emote)
        } else {
            container.appendChild(document.createTextNode(part)) // safely escapes
        }
    }

    const wrapper = document.createElement("span")
    wrapper.appendChild(container)
    return wrapper.innerHTML
}
