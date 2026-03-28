import { CreateLayout } from "./ui/layout";
import type { MediaView } from "./ui/panels/main/media-view";
import type { PanelView } from "./ui/panels/panel-view";
import type { SongsMedia } from "./types";

class App {
    private mediaView!: MediaView
    private view!: PanelView

    public Create() {
        const layout = CreateLayout()

        this.mediaView = layout.mediaView
        this.view = layout.panelView

        document.body.append(layout.root)
    }
    public UpdateMediaView(media: SongsMedia) {
        if (!this.view.windows.includes(this.mediaView)) {
            this.view.AddPanel(this.mediaView)
        }

        this.mediaView.Update(media)
        this.view.SelectPanel({ name: "Media View" })
    }
}

const app = new App();
export default app;