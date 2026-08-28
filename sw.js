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
  e.waitUntil(self.registration.showNotification(d.title || "Picks", {
    body: d.body || "",
    icon: "icon-192.png",
    badge: "icon-192.png",
    data: { id: d.id ?? null, url: d.url || null },
  }));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const data = e.notification.data || {};
  e.waitUntil((async () => {
    // A push can carry an explicit app URL (a CS2 call delivered through
    // the tennis subscription, or vice versa); honour it so the tap
    // lands on the right lane's app.
    if (data.url && !data.url.startsWith(self.registration.scope)) {
      return clients.openWindow(data.url);
    }
    const windows = await clients.matchAll({ type: "window",
                                             includeUncontrolled: true });
    for (const w of windows) {
      if ("focus" in w) {
        if (data.id != null) w.postMessage({ call: data.id });
        return w.focus();
      }
    }
    return clients.openWindow(data.id != null ? "./?call=" + data.id
                              : (data.url || "./"));
  })());
});
