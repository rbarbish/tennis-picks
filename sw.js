// Push-only service worker: shows notifications sent by the Mac server
// via Web Push. No fetch caching — the page always loads fresh.
self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) {}
  e.waitUntil(self.registration.showNotification(d.title || "Tennis Picks", {
    body: d.body || "",
    icon: "icon-192.png",
    badge: "icon-192.png",
  }));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: "window" }).then((ws) =>
    ws.length ? ws[0].focus() : clients.openWindow(".")));
});
