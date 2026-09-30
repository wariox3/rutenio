self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (e) {
    payload = {};
  }
  const titulo = payload.titulo || 'Ruteo';
  const body = payload.cuerpo || '';
  event.waitUntil(
    self.registration.showNotification(titulo, {
      body: body,
      icon: '/favicon.ico',
      data: payload.data || {},
      tag: 'seguimiento',
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((wins) => {
      for (const w of wins) {
        if ('focus' in w) return w.focus();
      }
      if (clients.openWindow) return clients.openWindow('/conductores-en-ruta');
    })
  );
});
