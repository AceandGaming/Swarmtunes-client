import '@ts/ui/panels/main/discover';
import '@ts/ui/panels/main/media-view';
import '@ts/ui/panels/panel-view';
import '@ts/ui/panels/current-song-bar';
import '@ts/ui/components/selectors/tab-bar';

export function CreateLayout() {
    const main = document.createElement("main");
    main.id = "app";

    const nav = document.createElement("nav");

    const header = document.createElement("st-tab-bar");
    const panelView = document.createElement("st-panel-view");

    const discover = document.createElement("st-discover-menu");
    const mediaView = document.createElement("st-media-view");

    panelView.Selector = header;
    panelView.AddPanel(discover);

    nav.append(header, panelView);

    const songbar = document.createElement("st-current-song-bar");

    main.append(nav, songbar);

    return {
        root: main,
        panelView,
        mediaView,
    };
}