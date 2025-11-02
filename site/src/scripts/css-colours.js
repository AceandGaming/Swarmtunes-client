class CssColours {
    static styles;

    static InitaliseColours() {
        const root = document.documentElement;
        const styles = getComputedStyle(root);

        this.styles = styles;
    }
    static GetColour(colourName) {
        return this.styles.getPropertyValue(`--${colourName}`).trim();
    }
}