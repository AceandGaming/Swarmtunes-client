export class Database<T extends { id: string }> {
    public get opened() {
        return !!this.db
    }

    private db?: IDBDatabase
    private storeName = "contents"

    private callbacks: (() => void)[] = []

    constructor(
        private readonly name: string
    ) { }

    public async Open() {
        this.db = await new Promise((resolve, reject) => {
            const req = indexedDB.open(this.name, 1)

            req.onupgradeneeded = () => {
                req.result.createObjectStore(this.storeName, { keyPath: "id" })
            }

            req.onsuccess = () => resolve(req.result)
            req.onerror = () => reject(req.error)
        })

        this.callbacks.forEach(cb => cb())
        this.callbacks = []
    }
    public WaitForOpen() {
        return new Promise<void>((resolve, reject) => {
            if (this.opened) {
                resolve()
            } else {
                this.callbacks.push(() => resolve())
            }
        })
    }

    public async GetMany(ids: string[]): Promise<T[]> {
        if (!this.db) {
            throw new Error("Database not opened")
        }
        const tx = this.db.transaction([this.storeName], "readonly")
        const store = tx.objectStore(this.storeName)

        function get(id: string) {
            return new Promise<T | undefined>((resolve, reject) => {
                const req = store.get(id)
                req.onsuccess = () => resolve(req.result)
                req.onerror = () => reject(req.error)
            })
        }

        return (await Promise.all(ids.map(get))).filter(item => item !== undefined)
    }
    public async Get(id: string): Promise<T | undefined> {
        return (await this.GetMany([id]))[0]
    }
    public async GetAll(): Promise<T[]> {
        if (!this.db) {
            throw new Error("Database not opened")
        }
        const tx = this.db.transaction([this.storeName], "readonly")
        const store = tx.objectStore(this.storeName)

        return await new Promise((resolve, reject) => {
            const req = store.getAll()
            req.onsuccess = () => resolve(req.result)
            req.onerror = () => reject(req.error)
        })
    }
    public async GetAllIds(): Promise<string[]> {
        if (!this.db) {
            throw new Error("Database not opened")
        }

        const tx = this.db.transaction([this.storeName], "readonly")
        const store = tx.objectStore(this.storeName)

        return await new Promise((resolve, reject) => {
            const req = store.getAllKeys()
            req.onsuccess = () => resolve(req.result as string[])
            req.onerror = () => reject(req.error)
        })
    }

    public async Exists(ids: string[]): Promise<string[]> {
        if (!this.db) {
            throw new Error("Database not opened")
        }
        const tx = this.db.transaction([this.storeName], "readonly")
        const store = tx.objectStore(this.storeName)

        function exists(id: string) {
            return new Promise<boolean>((resolve, reject) => {
                const req = store.count(id)
                req.onsuccess = () => resolve(req.result > 0)
                req.onerror = () => reject(req.error)
            })
        }

        const exist = []
        for (const id of ids) {
            if (await exists(id)) {
                exist.push(id)
            }
        }

        return exist
    }

    public async Put(...items: T[]) {
        if (!this.db) {
            throw new Error("Database not opened")
        }
        const tx = this.db.transaction([this.storeName], "readwrite")
        const store = tx.objectStore(this.storeName)

        function put(item: T) {
            return new Promise<void>((resolve, reject) => {
                const req = store.put(item)
                req.onsuccess = () => resolve()
                req.onerror = () => reject(req.error)
            })
        }

        await Promise.allSettled(items.map(put))
    }

    public async Delete(...ids: string[]) {
        if (!this.db) {
            throw new Error("Database not opened")
        }
        const tx = this.db.transaction([this.storeName], "readwrite")
        const store = tx.objectStore(this.storeName)

        function del(id: string) {
            return new Promise<void>((resolve, reject) => {
                const req = store.delete(id)
                req.onsuccess = () => resolve()
                req.onerror = () => reject(req.error)
            })
        }

        await Promise.allSettled(ids.map(del))
    }
}