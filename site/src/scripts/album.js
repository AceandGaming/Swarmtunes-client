function OnAlbumClick(event) {
    const uuid = event.target.dataset.uuid
    MediaView.ShowLoading()
    Network.GetAlbum(uuid).then(album => {
        AlbumView.Show(album)
    })
}