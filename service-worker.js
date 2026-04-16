// Service Worker - Pamelaccia Nipponica
// Gestisce notifiche push e caching base

const CACHE_NAME = 'pamelaccia-v1';

// === INSTALL ===
self.addEventListener('install', (event) => {
  console.log('[SW] Install');
  self.skipWaiting(); // attiva subito, non aspettare chiusura tab
});

// === ACTIVATE ===
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate');
  event.waitUntil(clients.claim());
});

// === RICEZIONE PUSH (dal server, fase 3C) ===
self.addEventListener('push', (event) => {
  console.log('[SW] Push ricevuta');
  let data = { title: '🏮 Pamelaccia!', body: 'È ora di votare', url: '/' };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch (e) { /* push senza payload */ }

  const options = {
    body: data.body,
    icon: 'https://em-content.zobj.net/source/apple/391/red-paper-lantern_1f3ee.png',
    badge: 'https://em-content.zobj.net/source/apple/391/red-paper-lantern_1f3ee.png',
    vibrate: [200, 100, 200],
    data: { url: data.url },
    requireInteraction: false
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// === CLICK SULLA NOTIFICA ===
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      // Se l'app è già aperta, portala in primo piano
      for (const client of windowClients) {
        if (client.url.includes(self.location.host) && 'focus' in client) {
          return client.focus();
        }
      }
      // Altrimenti aprila
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

// === MESSAGGIO DALLA PAGINA (per notifiche di test) ===
self.addEventListener('message', (event) => {
  if (event.data?.type === 'TEST_NOTIFICATION') {
    self.registration.showNotification('🏮 Test Pamelaccia', {
      body: 'Le notifiche funzionano! Preparati al 1 maggio.',
      icon: 'https://em-content.zobj.net/source/apple/391/red-paper-lantern_1f3ee.png',
      vibrate: [200, 100, 200]
    });
  }
});
