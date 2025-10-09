const print = console.log.bind(console)

colourThief = new ColorThief()

PlaylistTab.ShowLoggedOutScreen()
PopulateSearch("")
ShowContentWindow(document.getElementById("discover"))

SwarmFM.Initalise()
CssColours.InitaliseColours()
AttachAudioControls()
AttachButtons()
LoginPopup.AttachInputs()
CreatePlaylistPopup.AttachInputs()
RenamePlaylistPopup.AttachInputs()

PopulateDiscover()
function OnLogin() {
    document.getElementById("header-login-button").textContent = "Log Out"
    document.getElementById("header-login-button").setAttribute("onclick", "OnLogoutButtonClick()")
    PlaylistManager.GetPlaylists().then(PlaylistTab.Populate)

    for (let element of document.getElementsByClassName("require-auth")) {
        element.classList.remove("require-auth")
    }
}
LoginPopup.AddLoginCallback(OnLogin)

if (Network.IsLoggedIn()) {
    LoginPopup.CallLoginCallbacks()
}

function LoadUrlBar() {
    const queryString = window.location.search;
    print(queryString)
    const urlParams = new URLSearchParams(queryString);
    const songId = urlParams.get('song');

    if (songId !== null) {
        Network.GetSong(songId).then((song) => {
            SongQueue.LoadSingleSong(song)
            Audio.Play(song)
        })
    }

    const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
}
LoadUrlBar()