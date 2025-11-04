class CurrentSongBar {
    static #coverImage;
    static #artistText;
    static #titleText;
    static #singersText;
    static #element;

    static CreateDesktop() {
        const currentSongBar = document.createElement("div");
        currentSongBar.id = "current-song-bar";
        const leftContent = document.createElement("div");
        const middleContent = document.createElement("div");
        const rightContent = document.createElement("div");

        this.#coverImage = document.createElement("img");
        this.#coverImage.classList.add("cover");
        this.#coverImage.src = "src/assets/no-song.png";

        const wrapper = document.createElement("div");
        wrapper.classList.add("singer-wrapper");
        wrapper.textContent = "Covered By:";
        this.#singersText = document.createElement("span");
        this.#singersText.classList.add("sub-text");
        wrapper.append(this.#singersText);

        leftContent.append(this.#coverImage, wrapper);

        const titleContainer = document.createElement("div");
        titleContainer.classList.add("title-container");
        this.#titleText = document.createElement("span");
        this.#titleText.textContent = "Title";
        this.#artistText = document.createElement("span");
        this.#artistText.classList.add("sub-text");
        this.#artistText.textContent = "Artist";
        titleContainer.append(this.#titleText, this.#artistText);

        const seek = document.createElement("div");
        seek.id = "seek-bar-container";
        seek.innerHTML = `
        <span class="seek-time" id="song-time-start">0:00</span>
          <div id="seek-bar">
            <div id="seek-loaded"></div>
            <div id="seek-progress"></div>
          </div>
        <span class="seek-time" id="song-time-end">0:00</span>
        `;

        middleContent.append(titleContainer, seek);

        const buttons = document.createElement("div");
        buttons.id = "media-controls";
        const shuffleButton = document.createElement("img");
        shuffleButton.src = "src/assets/icons/shuffle.svg";
        shuffleButton.title = "Shuffle";
        shuffleButton.id = "shuffle-button";
        shuffleButton.onclick = OnShuffleButtonClick;
        const previousButton = document.createElement("img");
        previousButton.src = "src/assets/icons/track-prev.svg";
        previousButton.title = "Previous Song";
        previousButton.id = "previous-button";
        previousButton.onclick = OnPreviousButtonClick;
        const playPauseButton = document.createElement("img");
        playPauseButton.src = "src/assets/icons/play.svg";
        playPauseButton.title = "Play/Pause";
        playPauseButton.id = "play-pause";
        playPauseButton.onclick = OnPauseButtonClick;
        const nextButton = document.createElement("img");
        nextButton.src = "src/assets/icons/track-next.svg";
        nextButton.title = "Next Song";
        nextButton.id = "next-button";
        nextButton.onclick = OnNextButtonClick;
        const volumeControls = document.createElement("div");
        volumeControls.title = "Volume";
        volumeControls.tabIndex = 0;
        volumeControls.id = "volume-controls";
        volumeControls.innerHTML = `
            <input type="range" min="0" max="1" step="0.01" value="0.5" id="volume-slider">
            <img src="src/assets/icons/volume.svg"></img>
        `;

        buttons.append(
            shuffleButton,
            previousButton,
            playPauseButton,
            nextButton,
            volumeControls
        );
        rightContent.append(buttons);

        currentSongBar.append(leftContent, middleContent, rightContent);

        this.#element = currentSongBar;

        document.querySelector("footer").appendChild(currentSongBar);
    }
    static CreateMobile() {
        const currentSongBar = document.createElement("div");
        currentSongBar.id = "current-song-bar";
        const leftContent = document.createElement("div");
        const middleContent = document.createElement("div");
        const rightContent = document.createElement("div");

        this.#coverImage = document.createElement("img");
        this.#coverImage.classList.add("cover");
        this.#coverImage.src = "src/assets/no-song.png";

        const titleContainer = document.createElement("div");
        titleContainer.classList.add("title-container");
        this.#titleText = document.createElement("span");
        this.#titleText.textContent = "Title";
        this.#artistText = document.createElement("span");
        this.#artistText.classList.add("sub-text");
        this.#artistText.textContent = "Artist";
        titleContainer.append(this.#titleText, this.#artistText);

        leftContent.append(this.#coverImage, titleContainer);

        const seek = document.createElement("div");
        seek.id = "seek-bar-container";
        seek.innerHTML = `
        <div id="seek-bar">
          <div id="seek-loaded"></div>
          <div id="seek-progress"></div>
        </div>
        `;

        middleContent.append(seek);

        const buttons = document.createElement("div");
        buttons.id = "media-controls";
        const previousButton = document.createElement("img");
        previousButton.src = "src/assets/icons/track-prev.svg";
        previousButton.title = "Previous Song";
        previousButton.id = "previous-button";
        previousButton.onclick = OnPreviousButtonClick;
        const playPauseButton = document.createElement("img");
        playPauseButton.src = "src/assets/icons/play.svg";
        playPauseButton.title = "Play/Pause";
        playPauseButton.id = "play-pause";
        playPauseButton.onclick = OnPauseButtonClick;
        const nextButton = document.createElement("img");
        nextButton.src = "src/assets/icons/track-next.svg";
        nextButton.title = "Next Song";
        nextButton.id = "next-button";
        nextButton.onclick = OnNextButtonClick;

        buttons.append(previousButton, playPauseButton, nextButton);
        rightContent.append(buttons);

        currentSongBar.append(leftContent, middleContent, rightContent);

        this.#element = currentSongBar;

        document.querySelector("footer").appendChild(currentSongBar);
    }

    static DisplaySong(song) {
        this.#element.setAttribute("data-uuid", song.uuid);
        this.#element.setAttribute("data-rightclickcategory", "song");
        const url = song.CoverUrl(256);
        this.#titleText.textContent = song.title;
        this.#artistText.textContent = song.artist;
        this.#coverImage.src = url;
        if (this.#singersText) {
            this.#singersText.textContent = song.coverArtist.replace(",", "\n");
        }
        navigator.mediaSession.metadata = new MediaMetadata({
            title: song.title,
            artist: song.artist,
            artwork: [{ src: url, sizes: "256x256", type: "image/png" }],
        });
    }
}
