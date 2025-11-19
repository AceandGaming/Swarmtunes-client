
function OnAlbumClick(event) {
    const uuid = event.target.dataset.uuid
    MediaView.ShowLoading()
    Network.GetAlbum(uuid).then(album => {
        let title = album.title
        if (album.songs.length === 1) {
            title = "Special Release"
        }
        AlbumView.Show(album)
    })
}