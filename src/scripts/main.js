const print = console.log.bind(console)

colourThief = new ColorThief()

SwarmFM.Initalise()
CssColours.InitaliseColours()
AttachAudioControls()
AttachButtons()
LoginPopup.AttachInputs()
CreatePlaylistPopup.AttachInputs()

PopulateDiscover()
function OnLogin() {
    document.getElementById("header-login-button").textContent = "Log Out"
    document.getElementById("header-login-button").setAttribute("onclick", "OnLogoutButtonClick()")
    PlaylistManager.GetPlaylists().then(PlaylistTab.Populate)
}
LoginPopup.AddLoginCallback(OnLogin)

if (Network.IsLoggedIn()) {
    LoginPopup.CallLoginCallbacks()
}