
export function RGBToHSL(r: number, g: number, b: number) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (delta !== 0) {
        s = delta / (1 - Math.abs(2 * l - 1));

        switch (max) {
            case r:
                h = ((g - b) / delta) % 6;
                break;
            case g:
                h = (b - r) / delta + 2;
                break;
            case b:
                h = (r - g) / delta + 4;
                break;
        }

        h *= 60;
        if (h < 0) h += 360;
    }

    return { h: h, s: s * 100, l: l * 100 };
}
export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export function EnsureArray(arrayOrValue: any) {
    if (Array.isArray(arrayOrValue)) {
        return arrayOrValue
    }
    return [arrayOrValue]
}
export function FormatTime(seconds: number) {
    if (!isFinite(seconds)) {
        return "0:00"
    }
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
}
export function RefrenceCSS(source: string) {
    const link = document.createElement("link")
    link.setAttribute("rel", "stylesheet")
    link.setAttribute("href", "src/styles/" + source)
    return link
}
export function PrettyDate(date: Date): string {
    return date.toLocaleDateString("en-AU", {
        day: "numeric",
        month: "short",
        year: "numeric",
    })
}