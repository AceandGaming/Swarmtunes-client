const STATIC_CACHE = "static"
const DYNAMIC_CACHE = "dynamic-v7"

//Populated by a python file
const staticFiles = ['index.html', 'src/main-42f22ad8.js', 'src/styles-14b171ab.css', 'src/assets/neuro-cry.png', 'src/assets/evil-bg.png', 'src/assets/evil-cheer.webp', 'src/assets/no-song.png', 'src/assets/neuro-cheer.webp', 'src/assets/icons/edit-img.svg', 'src/assets/icons/disc.svg', 'src/assets/icons/playlist.svg', 'src/assets/icons/shuffle.svg', 'src/assets/icons/volume-off.svg', 'src/assets/icons/newero.avif', 'src/assets/icons/note.png', 'src/assets/icons/folder-plus.svg', 'src/assets/icons/layout-grid.svg', 'src/assets/icons/plus.svg', 'src/assets/icons/track-prev.svg', 'src/assets/icons/share.svg', 'src/assets/icons/newliv.avif', 'src/assets/icons/maximize.svg', 'src/assets/icons/x.svg', 'src/assets/icons/triple-dot.svg', 'src/assets/icons/tool.svg', 'src/assets/icons/search.svg', 'src/assets/icons/web.svg', 'src/assets/icons/play.svg', 'src/assets/icons/volume.svg', 'src/assets/icons/file-export.svg', 'src/assets/icons/swarmfm.png', 'src/assets/icons/track-next.svg', 'src/assets/icons/trash.svg', 'src/assets/icons/edit.svg', 'src/assets/icons/volume-2.svg', 'src/assets/icons/pause.svg', 'src/assets/icons/x-img.svg', 'src/assets/icons/playlist-remove.svg', 'src/assets/icons/playlist-add.svg', 'src/assets/icons/moon.svg', 'src/assets/neuro-bg.png']

//Folders must have trailing slash
const cacheFirstUrls = [
    "/covers/"
]

const networkFirstUrls = [

]

const offlineResponse = new Response("Offline", {
    status: 503,
    statusText: "Offline"
})

async function LoadStaticFiles() {
    try {
        const cache = await caches.open(STATIC_CACHE)
        await cache.addAll(staticFiles)
    }
    catch (error) {
        console.error("Error loading static files in service worker", error)
    }
}

self.addEventListener("install", (event) => {
    event.waitUntil(
        LoadStaticFiles().then(() => self.skipWaiting())
    )
})

async function ClearCaches() {
    const cacheNames = await caches.keys()
    for (const cacheName of cacheNames) {
        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            await caches.delete(cacheName)
        }
    }
}

self.addEventListener("activate", (event) => {
    event.waitUntil((async () => {
        try {
            await ClearCaches()
            self.clients.claim()
        }
        catch (error) {
            console.error("Failed to activate service worker", error)
        }
    })())
})

async function CacheFirst(event, cacheName) {
    const request = event.request
    const cache = await caches.open(cacheName)
    const cached = await cache.match(request)
    if (cached) {
        return cached
    }

    try {
        const response = await fetch(request)
        if (response.ok && response.type === "basic") {
            event.waitUntil(
                cache.put(request, response.clone())
            )
        }
        return response
    }
    catch {
        return offlineResponse
    }
}
async function NetworkFirst(event, cacheName) {
    const request = event.request
    const cache = await caches.open(cacheName)
    try {
        const response = await fetch(request)
        if (response.ok && response.type === "basic") {
            event.waitUntil(
                cache.put(request, response.clone())
            )
        }
        return response
    }
    catch {
        const cachedResponse = await cache.match(request)
        return cachedResponse || offlineResponse
    }
}

self.addEventListener("fetch", (event) => {
    if (event.request.mode === "navigate") {
        event.respondWith(
            NetworkFirst(event, STATIC_CACHE)
        )
        return
    }
    const url = new URL(event.request.url)
    for (let file of staticFiles) {
        if (url.pathname === `/${file}`) {
            event.respondWith(
                CacheFirst(event, STATIC_CACHE)
            )
            return
        }
    }
    for (let file of cacheFirstUrls) {
        if (url.pathname.startsWith(file)) {
            event.respondWith(
                CacheFirst(event, DYNAMIC_CACHE)
            )
            return
        }
    }
    for (let file of networkFirstUrls) {
        if (url.pathname.startsWith(file)) {
            event.respondWith(
                NetworkFirst(event, DYNAMIC_CACHE)
            )
            return
        }
    }
    event.respondWith(
        fetch(event.request).catch(() => offlineResponse)
    )
})