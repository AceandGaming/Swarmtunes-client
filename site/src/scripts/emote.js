function ReplaceEmotesOfString(text) {
    const emoteStrings = text.match(/:[a-zA-Z0-9]+/g)
    let newText = text.replace(/[<>:/\\.,?!"']/g, "")
    if (!emoteStrings) {
        return newText
    }
    for (let emoteString of emoteStrings) {
        emoteString = emoteString.replace(":", "")
        const emote = `<img src="${Network.GetEmoteUrl(emoteString)}" alt="${emoteString}" class="emote">`
        newText = newText.replace(emoteString, emote)
    }
    return newText
}