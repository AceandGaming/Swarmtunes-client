import '@ts/ui/panels/main/discover';
import '@ts/ui/panels/main/media-view';
import '@ts/ui/panels/panel-view';
import '@ts/ui/panels/current-song-bar';
import '@ts/ui/panels/main/header';
import '@ts/ui/panels/now-playing';

export function CreateLayout() {
    const main = document.createElement("main");
    main.id = "app";

    const nav = document.createElement("nav");

    const panelView = document.createElement("st-panel-view");

    const header = document.createElement("st-header");
    panelView.Selector = header.TabBar;

    const discover = document.createElement("st-discover-menu");
    panelView.AddPanel(discover);

    const NowPlaying = document.createElement("st-now-playing");

    const content = document.createElement("div")
    content.classList.add("content")

    content.append(NowPlaying, panelView)


    nav.append(header, content);

    const songbar = document.createElement("st-current-song-bar");

    main.append(nav, songbar);

    const mediaView = document.createElement("st-media-view");

    return {
        root: main,
        panelView,
        mediaView,
    };
}