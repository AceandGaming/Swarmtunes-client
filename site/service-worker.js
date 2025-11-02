self.addEventListener("install", (event) => {
  self.skipWaiting(); // activate immediately
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});
