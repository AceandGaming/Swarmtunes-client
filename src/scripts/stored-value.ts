

export default class StoredValue<T> {
    private value: T

    constructor(public key: string, public defaultValue: T) {
        this.value = this.load()
    }

    public set(value: T) {
        this.value = value
        try {
            localStorage.setItem(this.key, JSON.stringify(value))
        }
        catch (e) {
            console.error("Failed to save", this.key, e)
        }
    }
    public get() {
        return this.value
    }

    private load(): T {
        try {
            const value = localStorage.getItem(this.key)
            if (value === null) {
                return this.defaultValue
            }
            return JSON.parse(value)
        }
        catch (e) {
            console.error("Failed to get", this.key, e)
            return this.defaultValue
        }
    }
}