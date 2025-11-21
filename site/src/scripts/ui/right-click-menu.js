const rightClickMenu = document.getElementById("right-click-menu");
let time;
let touchPosition;

class RightClickOption {
    constructor(
        name,
        action,
        category = "none",
        icon = null,
        requiresAccount = false
    ) {
        this.name = name;
        this.action = action;
        this.icon = icon;
        this.category = category;
        this.requiresAccount = requiresAccount;
    }
}
let menuItems = {};
class MenuItem {
    constructor(options, inheritFrom = null) {
        if (inheritFrom !== null && inheritFrom in menuItems) {
            options = [...menuItems[inheritFrom].options, ...options];
        }
        this.options = options;
    }
}
function PopulateRightClickMenu(options, eventObject) {
    const categories = {};
    rightClickMenu.innerHTML = "";
    for (const option of options) {
        if (option.category in categories) {
            categories[option.category].push(option);
        } else {
            categories[option.category] = [option];
        }
    }
    for (const category in categories) {
        const options = categories[category];
        let categoryElement = document.createElement("div");
        categoryElement.classList.add("category");
        for (const option of options) {
            if (option.requiresAccount && !Network.IsLoggedIn()) {
                continue;
            }
            if (option.icon !== null) {
                const div = document.createElement("div");
                div.className = "option";
                div.innerHTML = `<span>${option.name}</span><img src="${option.icon}">`;
                div.addEventListener("click", (event) =>
                    OnRightClickMenuOptionClick(
                        event,
                        eventObject,
                        option.action
                    )
                );
                categoryElement.appendChild(div);
            } else {
                const div = document.createElement("div");
                div.className = "option";
                div.innerHTML = `<span>${option.name}</span>`;
                div.addEventListener("click", (event) =>
                    OnRightClickMenuOptionClick(
                        event,
                        eventObject,
                        option.action
                    )
                );
                categoryElement.appendChild(div);
            }
        }
        rightClickMenu.appendChild(categoryElement);
    }
}
function OnRightClick(event) {
    event.preventDefault();
    event.stopPropagation();
    const catagory = event.target.dataset.rightclickcategory;
    if (catagory === undefined || menuItems[catagory] === undefined) {
        return;
    }
    const options = menuItems[catagory].options;
    if (options === undefined) {
        return;
    }
    PopulateRightClickMenu(options, event);
    rightClickMenu.style.display = "flex";

    if (event.clientX + rightClickMenu.offsetWidth > window.innerWidth) {
        rightClickMenu.style.left = event.clientX - rightClickMenu.offsetWidth + "px";
    }
    else {
        rightClickMenu.style.left = event.clientX + "px";
    }
    if (event.clientY + rightClickMenu.offsetHeight > window.innerHeight) {
        rightClickMenu.style.top = event.clientY - rightClickMenu.offsetHeight + "px";
    }
    else {
        rightClickMenu.style.top = event.clientY + "px";
    }
}
function OnRightClickMenuOptionClick(event, eventObject, callback) {
    rightClickMenu.style.display = "none";
    document.removeEventListener("touchmove", PreventScroll);
    callback(eventObject, event);
}

function PreventScroll(event) {
    event.preventDefault();
}

function OnStartPress(event) {
    time = new Date().getTime();
    touchPosition = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
    };
}
function OnStopPress(event) {
    if (new Date().getTime() - time < 500) {
        return;
    }
    const touch = event.changedTouches[0];
    if (
        Math.abs(touch.clientX - touchPosition.x) > 50 ||
        Math.abs(touch.clientY - touchPosition.y) > 50
    ) {
        return;
    }
    event.clientX = touch.clientX - 50;
    event.clientY = touch.clientY - 20;
    document.addEventListener("touchmove", PreventScroll, { passive: false });
    OnRightClick(event);
}
document.addEventListener("touchstart", OnStartPress);
document.addEventListener("touchend", OnStopPress);
document.addEventListener("contextmenu", OnRightClick);
document.addEventListener("mousedown", (event) => {
    if (!rightClickMenu.contains(event.target)) {
        rightClickMenu.style.display = "none";
        document.removeEventListener("touchmove", PreventScroll);
    }
});

function OnSongExportClick(event, uiEvent) {
    const uuid = event.target.dataset.uuid;
    Network.GetMP3(uuid, true);
}
function OnPlayNextClick(event, uiEvent) {
    const uuid = event.target.dataset.uuid;
    Network.GetSong(uuid).then((song) => {
        SongQueue.PlayNow([song]);
        AudioPlayer.instance.Play(song);
    });
}
function RemoveFromQueue(event, uiEvent) {
    const uuid = event.target.dataset.uuid;
    SongQueue.RemoveSong(uuid);
    NowPlaying.Update();
}
async function OnAddToPlaylistClick(event, uiEvent) {
    const uuid = event.target.dataset.uuid;
    const playlistUuid = await SelectPlaylist.AskUser();
    if (playlistUuid === null) {
        return;
    }
    const song = await Network.GetSong(uuid);
    const playlist = PlaylistManager.GetPlaylist(playlistUuid);
    await playlist.GetSongs();
    playlist.Add(song);
}
function OnRemoveFromPlaylistClick(event, uiEvent) {
    const uuid = event.target.dataset.uuid;
    const playlistUuid = PlaylistView.playlist.Id
    console.log(playlistUuid)
    if (playlistUuid === undefined) {
        return;
    }
    const playlist = PlaylistManager.GetPlaylist(playlistUuid);
    playlist.Remove(new SongPlaceholder(uuid));
    PlaylistView.Update();
}
async function OnDeletePlaylistClick(event, uiEvent) {
    const uuid = event.target.dataset.uuid;
    const confirmation = await ConfirmAction.AskUser("You are about to delete this playlist.")
    if (!confirmation) {
        return;
    }
    PlaylistManager.RemovePlaylist(uuid);
}
function OnNewPlaylistClick(event, uiEvent) {
    CreatePlaylistPopup.Show();
}
async function OnRenamePlaylistClick(event, uiEvent) {
    const uuid = event.target.dataset.uuid;
    RenamePlaylistPopup.instance.Show(uuid);
}
async function OnSongShareClick(event, uiEvent) {
    const uuid = event.target.dataset.uuid;
    const url =
        "https://share.swarmtunes.com/?s=" + (await Network.ShareSong(uuid));
    navigator.clipboard.writeText(url);
}
function OnAlbumExportClick(event, uiEvent) {
    const uuid = event.target.dataset.uuid;
    Network.GetAlbumMP3s(uuid);
}
async function OnAlbumAddToPlaylistClick(event, uiEvent) {
    const uuid = event.target.dataset.uuid;
    const playlistUuid = await SelectPlaylist.AskUser();
    if (playlistUuid === null) {
        return;
    }
    const album = await Network.GetAlbum(uuid);
    const playlist = PlaylistManager.GetPlaylist(playlistUuid);
    await playlist.LoadSongs();
    playlist.AddMultipleSongs(album.songs);
}
function OnAlbumPlayNowClick(event, uiEvent) {
    const uuid = event.target.dataset.uuid;
    Network.GetAlbum(uuid, true).then((album) => {
        SongQueue.PlayNow(album.songs);
        AudioPlayer.instance.Play(album.songs[0]);
    });
}
function OnClearQueueClick(event, uiEvent) {
    SongQueue.ClearSongQueue();
    NowPlaying.Update()
}

//fill options
menuItems["song"] = new MenuItem([
    new RightClickOption(
        "Play Now",
        OnPlayNextClick,
        "queue",
        "src/assets/icons/play-img.svg"
    ),
    new RightClickOption(
        "Add To Playlist",
        OnAddToPlaylistClick,
        "playlist",
        "src/assets/icons/playlist-add.svg",
        true
    ),
    new RightClickOption(
        "Share",
        OnSongShareClick,
        "share",
        "src/assets/icons/share.svg"
    ),
    new RightClickOption(
        "Export",
        OnSongExportClick,
        "share",
        "src/assets/icons/file-export.svg"
    ),
]);
menuItems["now-playing-item"] = new MenuItem(
    [
        new RightClickOption(
            "Remove",
            RemoveFromQueue,
            "queue",
            "src/assets/icons/playlist-remove.svg"
        ),
        new RightClickOption(
            "Clear Queue",
            OnClearQueueClick,
            "queue",
            "src/assets/icons/x-img.svg"
        ),
    ],
    "song"
);
menuItems["playlist-item"] = new MenuItem(
    [
        new RightClickOption(
            "Remove From Playlist",
            OnRemoveFromPlaylistClick,
            "playlist",
            "src/assets/icons/playlist-remove.svg"
        ),
    ],
    "song"
);

menuItems["playlist"] = new MenuItem([
    new RightClickOption(
        "New Playlist",
        OnNewPlaylistClick,
        "playlist",
        "src/assets/icons/plus.svg"
    ),
    new RightClickOption(
        "Rename Playlist",
        OnRenamePlaylistClick,
        "playlist",
        "src/assets/icons/edit.svg"
    ),
    new RightClickOption(
        "Delete Playlist",
        OnDeletePlaylistClick,
        "playlist",
        "src/assets/icons/trash.svg"
    ),
]);

menuItems["album"] = new MenuItem([
    new RightClickOption(
        "Play Now",
        OnAlbumPlayNowClick,
        "queue",
        "src/assets/icons/play-img.svg"
    ),
    new RightClickOption(
        "Add Songs To Playlist",
        OnAlbumAddToPlaylistClick,
        "playlist",
        "src/assets/icons/playlist-add.svg",
        true
    ),
    new RightClickOption(
        "Export",
        OnAlbumExportClick,
        "share",
        "src/assets/icons/file-export.svg"
    ),
]);
