const CACHE_NAME = "v7";
const pathsToCache = [
    "/",
    "/index.html",
    "/src/styles.css",
    "/src/main.js",
    "/src/assets/neuro-bg.png",
    "/src/assets/evil-bg.png",
];
const requestsToCache = ["/src/assets/", "/covers/"];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(pathsToCache);
        })
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        (async () => {
            const cachedResponse = await caches.match(event.request);
            if (cachedResponse) return cachedResponse;
            try {
                const response = await fetch(event.request);
                if (response && response.status === 200) {
                    for (const path of requestsToCache) {
                        const url = new URL(event.request.url);
                        if (url.pathname.startsWith(path)) {
                            console.log("Caching:", url.pathname);
                            const cache = await caches.open(CACHE_NAME);
                            await cache.put(event.request, response.clone());
                            break;
                        }
                    }
                }
                return response;
            } catch (err) {
                return (
                    cachedResponse ||
                    new Response("Network error", { status: 503 })
                );
            }
        })()
    );
});
