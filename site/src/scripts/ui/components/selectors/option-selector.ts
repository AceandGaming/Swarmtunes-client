abstract class OptionSelector extends UIObject {
    abstract SelectOption(index: number): void
    abstract AddOptions(options: string[]): void
    abstract AddCallback(callback: (index: number, name: string) => void): void
}