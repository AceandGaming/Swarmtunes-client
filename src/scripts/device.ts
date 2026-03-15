export const Device = {
    get isMobile(): boolean {
        return window.matchMedia("(pointer: coarse)").matches;
    },
    get isTablet(): boolean {
        return this.isMobile && Math.min(window.screen.width, window.screen.height) >= 768;
    }
};