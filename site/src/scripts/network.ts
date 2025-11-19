type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json };
type id = string

// class SwarmFMInfo {
//     constructor(currentSong, nextSong, position, duration) {
//         this.currentSong = currentSong;
//         this.nextSong = nextSong;
//         this.position = position;
//         this.duration = duration;
//     }
// }

class Network {
    static get serverURL() {
        return "https://dev-api.swarmtunes.com";
        //return "https://api.swarmtunes.com";
    }
    static get userToken() {
        return localStorage.getItem("userToken"); //bad but I don't care
    }
    static IsLoggedIn() {
        return this.userToken !== null;
    }
    static IsAdmin() {
        return localStorage.getItem("isAdmin") == "true";
    }

    static async SafeFetch(url: string, method: "GET" | "POST" | "DELETE" | "PUT" | "PATCH", body?: Json) {
        const response = await fetch(`${this.serverURL}/${url}`, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.userToken}`,
            },
            body: JSON.stringify(body),
        });
        if (
            !response.ok &&
            response.status == 401 &&
            response.headers.get("token-expired") == "true"
        ) {
            localStorage.removeItem("userToken");
            window.location.reload();
            throw new Error("token expired");
        }
        return response;
    }
    static async Get(url: string) {
        return await this.SafeFetch(url, "GET");
    }
    static async QuickGet(url: string) {
        return await fetch(`${this.serverURL}/${url}`);
    }
    static async Post(url: string, data: Json) {
        return await this.SafeFetch(url, "POST", data);
    }
    static async Delete(url: string) {
        return await this.SafeFetch(url, "DELETE");
    }
    static async Put(url: string, data: Json) {
        return await this.SafeFetch(url, "PUT", data);
    }
    static async Patch(url: string, data: Json) {
        return await this.SafeFetch(url, "PATCH", data);
    }

    static async GetSwarmFMStream() {
        const response = await this.Get(`swarmfm`);
        const json = await response.json();
        return `${json[0]}?now=${Date.now()}`;
    }
    // static async GetSwarmFMInfo() {
    //     const response = await fetch("https://swarmfm.boopdev.com/v2/player");
    //     if (!response.ok) {
    //         console.error("Failed to get swarmfm info");
    //         return;
    //     }
    //     const json = await response.json();
    //     const current = json["current"];
    //     const next = json["next"];

    //     function ConvertCoverartist(artists: string[]) {
    //         if (artists.length == 1) {
    //             return artists[0];
    //         } else {
    //             return "duet";
    //         }
    //     }
    //     const type = ConvertCoverartist(current["singer"])
    //     let song = null;
    //     if (current["album_cover"]) {
    //         const songs = await this.GetAllSongs({
    //             filters: [
    //                 "title=" + current["name"],
    //                 "artist=" + current["artist"]
    //             ]
    //         });
    //         if (songs.length > 0) {
    //             song = songs[0]
    //         }
    //     }

    //     const currentSong = new Song(
    //         song && song.id || "swarmfm",
    //         current["name"],
    //         current["artist"],
    //         current["singer"],
    //         "unknown",
    //         type,
    //         false,
    //         song && song.hasCustomCover
    //     );
    //     const nextSong = new Song(
    //         "swarmfm",
    //         next["name"],
    //         next["artist"],
    //         current["singer"],
    //         "unknown",
    //         ConvertCoverartist(next["singer"])
    //     );
    //     const position = json["position"];
    //     const duration = current["duration"];

    //     return new SwarmFMInfo(currentSong, nextSong, position, duration);
    // }
    static async GetSong(id: id | id[]) {
        const params = new URLSearchParams();
        const ids = EnsureArray(id);
        for (let i = 0; i < ids.length; i++) {
            params.append("ids", ids[i]);
        }
        const response = await this.Get(`songs?${params.toString()}`);
        const songs = [];
        for (const dict of await response.json()) {
            songs.push(new Song(dict));
        }
        return Array.isArray(id) ? songs : songs[0];
    }
    static async ShareSong(id: id) {
        const response = await this.Get(`songs/${id}/share`);
        const json = await response.json();
        return json["link"];
    }
    static async GetMP3(id: id, isTagged: boolean = false) {
        const a = document.createElement("a");
        a.href = `${this.serverURL}/files/${id}?export=${isTagged}`;
        a.click();
        a.remove();
    }
    static GetCover(name: string, size: number = 128) {
        if (!name) {
            //console.error("Invalid cover name", name);
            return "src/assets/no-song.png";
        }
        return `${this.serverURL}/covers/${name}?size=${size}`;
    }
    static async GetAllSongs({ filters = [], maxResults = 100 } = {}) {
        const params = new URLSearchParams();
        params.append("filters", filters.join(","));
        params.append("maxResults", String(maxResults));
        const response = await this.Get(`songs?${params.toString()}`);
        const songs = [];
        for (const dict of await response.json()) {
            songs.push(new Song(dict));
        }
        return songs;
    }
    static async Search(query: string) {
        const params = new URLSearchParams();
        params.append("query", query);
        const response = await this.QuickGet(`search?${params.toString()}`);
        const songs = [];
        for (const dict of await response.json()) {
            songs.push(new Song(dict));
        }
        return songs;
    }

    static async GetAlbum(id: id | id[], getSongs: boolean = false) {
        const params = new URLSearchParams();
        const ids = EnsureArray(id);
        for (let i = 0; i < ids.length; i++) {
            params.append("ids", ids[i]);
        }
        const response = await this.Get(`albums?${params.toString()}`);
        const albums = [];
        for (const dict of await response.json()) {
            albums.push(new Album(dict));
        }
        if (getSongs) {
            for (const album of albums) {
                await album.GetSongs();
            }
        }
        return EnsureValue(albums);
    }
    static async GetAllAlbums(...filters: string[]) {
        const params = new URLSearchParams();
        params.append("filters", filters.join(","));
        const response = await this.Get(`albums?${params.toString()}`);
        const albums = [];
        for (const dict of await response.json()) {
            albums.push(new Album(dict));
        }
        return albums;
    }
    static async GetAlbumMP3s(id: id) {
        const a = document.createElement("a");
        a.href = `${this.serverURL}/files/album/${id}`;
        a.click();
        a.remove();
    }

    // static async GetEmote(nameOrNames) {
    //     const params = new URLSearchParams();
    //     const names = EnsureArray(nameOrNames);
    //     for (let i = 0; i < names.length; i++) {
    //         params.append("names", names[i]);
    //     }
    //     const response = await this.Get(`emotes/?${params.toString()}`);
    //     return EnsureValue(response.json()); //just a list of urls. no class
    // }

    static async Login(username: string, password: string) {
        const response = await this.Post(`users/login`, {
            username: username,
            password: password,
        });
        const json = await response.json();
        if (json["token"]) {
            localStorage.setItem("userToken", json["token"]);
            localStorage.setItem("isAdmin", json["isAdmin"]);
        } else {
            return json["detail"];
        }
    }
    static async Register(username: string, password: string) {
        const response = await this.Post(`users/login`, {
            username: username,
            password: password,
            create: true,
        });
        const json = await response.json();
        if (json["token"]) {
            localStorage.setItem("userToken", json["token"]);
            localStorage.setItem("isAdmin", json["isAdmin"]);
        } else {
            return json["detail"];
        }
    }
    static async LogOut() {
        await this.Post(`me/logout`, {});
        localStorage.removeItem("userToken");
        window.location.reload();
    }

    static async GetPlaylist(idOrIds: id | id[], getSongs: boolean = false) {
        const params = new URLSearchParams();
        const ids = EnsureArray(idOrIds);
        for (let i = 0; i < ids.length; i++) {
            params.append("ids", ids[i]);
        }
        const response = await this.Get(`playlists?${params.toString()}`);
        const playlists = [];
        for (const dict of await response.json()) {
            playlists.push(new Playlist(dict));
        }
        if (getSongs) {
            for (const playlist of playlists) {
                await playlist.GetSongs();
            }
        }
        return EnsureValue(playlists);
    }
    static async GetAllPlaylists() {
        const response = await this.Get(`playlists`);
        const playlists = [];
        for (const dict of await response.json()) {
            playlists.push(new Playlist(dict));
        }
        return playlists;
    }
    static async CreatePlaylist(name: string) {
        const response = await this.Post(`playlists`, { name: name });
        const json = await response.json();
        if (!response.ok) {
            return { error: json["detail"] };
        }
        return new Playlist(json);
    }
    static async DeletePlaylist(playlist: id) {
        await this.Delete(`playlists/${playlist}`);
    }
    static async AddSongToPlaylist(playlist: id, songs: id[]) {
        await this.Patch(`playlists/${playlist}/add`, {
            songs: EnsureArray(songs),
        });
    }
    static async RemoveSongFromPlaylist(playlist: id, songs: id[]) {
        await this.Patch(`playlists/${playlist}/remove`, {
            songs: EnsureArray(songs),
        });
    }
    static async RenamePlaylist(playlist: id, name: string) {
        await this.Patch(`playlists/${playlist}`, { name: name });
    }

    static async ServerResync() {
        RequireAdmin();
        await this.Post("resync", {});
    }
}
