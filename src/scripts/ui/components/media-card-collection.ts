import { UIObject } from "../ui";
import { Song, Album, Playlist } from "@ts/types";
import css from "@css/components/media-card-collection.scss?inline"
import { MediaCard } from "./media-card";
import { PlaybackController } from "@ts/playback";
import app from "@ts/app";

export class MediaCardCollection extends UIObject {
    private cards: MediaCard[] = []
    private cardsContainer: HTMLElement

    constructor() {
        super()

        const shadow = this.attachShadow({ mode: "open" });

        const style = document.createElement("style")
        style.textContent = css
        shadow.append(style)

        this.cardsContainer = document.createElement("div")
        this.cardsContainer.classList.add("cards-container")

        shadow.append(this.cardsContainer)
    }

    private OnSongCardClick(event: Event) {
        const songs = []
        const song = (event.target as MediaCard).media
        if (!(song instanceof Song)) {
            return
        }

        for (const card of this.cards) {
            if (card.media instanceof Song) {
                songs.push(card.media)
            }
        }

        PlaybackController.PlaySonglist(songs, song)
    }
    private OnAlbumCardClick(event: Event) {
        const album = (event.target as MediaCard).media
        if (!(album instanceof Album)) {
            return
        }

        app.UpdateMediaView(album)
    }
    private OnPlaylistCardClick(event: Event): never {
        //TBD
        throw new Error("Not implemented")
    }

    public AddCard(card: MediaCard, onClick: (event: Event) => void, frag?: DocumentFragment) {
        this.cards.push(card)
        if (frag) {
            frag.append(card)
        }
        else {
            this.cardsContainer.append(card)
        }

        card.addEventListener("mousedown", onClick)
    }
    public PopulateWithSongs(songs: Song[]) {
        songs = songs.sort((a, b) => b.Date.getTime() - a.Date.getTime())
        const fragment = document.createDocumentFragment()

        for (const song of songs) {
            const card = MediaCard.CreateFromMedia(song)
            this.AddCard(card, this.OnSongCardClick.bind(this), fragment)
        }

        this.cardsContainer.append(fragment)
    }
    public PopulateWithAlbums(albums: Album[]) {
        albums = albums.sort((a, b) => b.Date.getTime() - a.Date.getTime())
        const fragment = document.createDocumentFragment()

        for (const album of albums) {
            const card = MediaCard.CreateFromMedia(album)
            this.AddCard(card, this.OnAlbumCardClick.bind(this), fragment)
        }

        this.cardsContainer.append(fragment)
    }
    public PopulateWithPlaylists(playlists: Playlist[]) {
        playlists = playlists.sort((a, b) => b.Date.getTime() - a.Date.getTime())
        const fragment = document.createDocumentFragment()

        for (const playlist of playlists) {
            const card = MediaCard.CreateFromMedia(playlist)
            this.AddCard(card, this.OnPlaylistCardClick.bind(this), fragment)
        }

        this.cardsContainer.append(fragment)
    }
}

customElements.define("st-media-card-collection", MediaCardCollection)