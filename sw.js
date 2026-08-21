// Push-only service worker: shows notifications sent by the Mac server
// via Web Push, and opens the app scrolled to the call that was tapped.
// No fetch caching — the page always loads fresh.
// Take over as soon as a new version lands, so updates don't wait for
// every window to close.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(clients.claim()));

self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) {}
  e.waitUntil(self.registration.showNotification(d.title || "Tennis Picks", {
    body: d.body || "",
    icon: "icon-192.png",
    badge: "icon-192.png",
    data: { id: d.id ?? null },
  }));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const id = e.notification.data && e.notification.data.id;
  e.waitUntil((async () => {
    const windows = await clients.matchAll({ type: "window",
                                             includeUncontrolled: true });
    for (const w of windows) {
      if ("focus" in w) {
        // Already open: focus it and tell the page where to scroll.
        if (id != null) w.postMessage({ call: id });
        return w.focus();
      }
    }
    return clients.openWindow(id != null ? "./?call=" + id : "./");
  })());
});
