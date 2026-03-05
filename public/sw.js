// Caseout Studio — Service Worker for Push Notifications

self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener("push", (e) => {
  let data = { title: "Caseout Studio", body: "Nowe powiadomienie", url: "/vault-x9k2m" };
  try {
    data = e.data.json();
  } catch (err) {
    data.body = e.data ? e.data.text() : "Nowe powiadomienie";
  }

  const options = {
    body: data.body || "",
    icon: "/logo.png",
    badge: "/logo.png",
    tag: data.tag || "caseout-" + Date.now(),
    renotify: true,
    data: { url: data.url || "/vault-x9k2m" },
    actions: data.actions || [],
    vibrate: [200, 100, 200],
  };

  e.waitUntil(self.registration.showNotification(data.title || "Caseout Studio", options));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = e.notification.data?.url || "/vault-x9k2m";

  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes("/vault-x9k2m") && "focus" in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
