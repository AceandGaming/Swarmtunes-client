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
