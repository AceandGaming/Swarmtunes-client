class SongPlaceholder {
    get uuid() {
        return this.#uuid;
    }
    get Id() {
        return this.#uuid;
    }
    get coverArtist() {
        throw new Error("Song placeholder has no cover artist");
    }
    get jsDate() {
        throw new Error("Song placeholder has no date");
    }
    get title() {
        throw new Error("Song placeholder has no title");
    }
    get artist() {
        throw new Error("Song placeholder has no artist");
    }

    #uuid;

    constructor(uuid) {
        this.#uuid = uuid;
    }

    CoverUrl(size = 128) {
        return Network.GetCoverUrl(this.uuid, size);
    }
    ToString() {
        return `Song placeholder (${this.uuid})`;
    }
    async GetLoaded() {
        return await Network.GetSong(this.uuid);
    }
    Copy() {
        return new SongPlaceholder(this.uuid);
    }
}

function OnSongClick(event) {
    const uuid = event.target.dataset.uuid;
    Network.GetSong(uuid).then((song) => {
        AudioPlayer.instance.Play(song);
        SongQueue.LoadSingleSong(song);
    });
}
function CloneSongs(songs) {
    const newSongs = [];
    for (const song of songs) {
        newSongs.push(song.Copy());
    }
    return newSongs;
}
