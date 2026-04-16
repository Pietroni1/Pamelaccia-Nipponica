// Service Worker - Pamelaccia Nipponica v3

self.addEventListener('install', () => {
  console.log('[SW] Install v3');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activate v3');
  event.waitUntil(clients.claim());
});

// === RICEZIONE PUSH (dal server) ===
self.addEventListener('push', (event) => {
  console.log('[SW] Push ricevuta, dati:', event.data ? 'sì' : 'no');
  
  let title = '🏮 Pamelaccia!';
  let body = 'È ora di votare il peggiore di oggi!';
  let url = './';

  // Se c'è un payload, prova a leggerlo
  if (event.data) {
    try {
      const data = event.data.json();
      title = data.title || title;
      body = data.body || body;
      url = data.url || url;
    } catch (e) {
      // Payload non parsabile, usa i default
      console.log('[SW] Payload non parsabile, uso default');
    }
  }

  event.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      icon: 'https://em-content.zobj.net/source/apple/391/red-paper-lantern_1f3ee.png',
      badge: 'https://em-content.zobj.net/source/apple/391/red-paper-lantern_1f3ee.png',
      vibrate: [200, 100, 200],
      data: { url: url },
      requireInteraction: true,
      tag: 'pamelaccia-daily'
    })
  );
});

// === CLICK SULLA NOTIFICA ===
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

// === TEST LOCALE (dal bottone nell'app) ===
self.addEventListener('message', (event) => {
  if (event.data?.type === 'TEST_NOTIFICATION') {
    self.registration.showNotification('🏮 Test Pamelaccia', {
      body: 'Le notifiche funzionano! Preparati al 1 maggio.',
      icon: 'https://em-content.zobj.net/source/apple/391/red-paper-lantern_1f3ee.png',
      vibrate: [200, 100, 200]
    });
  }
});
