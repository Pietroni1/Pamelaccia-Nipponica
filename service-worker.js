// Service Worker - Pamelaccia Nipponica v2
// Push notifications + offline base

const CACHE_NAME = 'pamelaccia-v2';

self.addEventListener('install', () => {
  console.log('[SW] Install v2');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activate v2');
  event.waitUntil(clients.claim());
});

// === RICEZIONE PUSH DAL SERVER ===
self.addEventListener('push', (event) => {
  console.log('[SW] Push ricevuta');
  let data = { title: '🏮 Pamelaccia!', body: 'È ora di votare il peggiore di oggi!', url: './' };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch (e) { /* push senza payload, usa i default */ }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: 'https://em-content.zobj.net/source/apple/391/red-paper-lantern_1f3ee.png',
      badge: 'https://em-content.zobj.net/source/apple/391/red-paper-lantern_1f3ee.png',
      vibrate: [200, 100, 200],
      data: { url: data.url },
      requireInteraction: true,
      tag: 'pamelaccia-daily'  // sovrascrive notifiche precedenti non lette
    })
  );
});

// === CLICK SULLA NOTIFICA → APRI L'APP ===
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || './';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.host) && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});

// === MESSAGGIO DALLA PAGINA (test locale) ===
self.addEventListener('message', (event) => {
  if (event.data?.type === 'TEST_NOTIFICATION') {
    self.registration.showNotification('🏮 Test Pamelaccia', {
      body: 'Le notifiche funzionano! Preparati al 1 maggio.',
      icon: 'https://em-content.zobj.net/source/apple/391/red-paper-lantern_1f3ee.png',
      vibrate: [200, 100, 200]
    });
  }
});
