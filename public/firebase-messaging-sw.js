importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyD_3anB_egDIJQ_3hMLAYXpLacgXQiOeGg",
  authDomain: "fabpro-5d374.firebaseapp.com",
  projectId: "fabpro-5d374",
  storageBucket: "fabpro-5d374.firebasestorage.app",
  messagingSenderId: "11088297618",
  appId: "1:11088297618:web:89611714cef9a8825a704b",
});

const messaging = firebase.messaging();

console.log('Firebase messaging initialized in service worker');

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("Background Message received:", payload);

  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: payload.notification?.icon || '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'firebase-background-notification',
    requireInteraction: true,
    data: payload.data || {}
  };

  // Show notification with better options
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) 
    || (event.notification.data && event.notification.data.click_action)
    || '/';

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Focus existing tab if open
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new tab
      return clients.openWindow(targetUrl);
    })
  );
});
