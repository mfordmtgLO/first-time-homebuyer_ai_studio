// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Must match your exact firebase-applet-config.json credentials
const firebaseConfig = {
  apiKey: "AIzaSyD2RXplEZ6cZCFJJL7LKOQUm-cG-R6FUjU",
  authDomain: "astral-web-439103-g7.firebaseapp.com",
  projectId: "astral-web-439103-g7",
  storageBucket: "astral-web-439103-g7.firebasestorage.app",
  messagingSenderId: "664893075850",
  appId: "1:664893075850:web:334f48a8b03ac4265e9873"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background notification delivery when device is locked or app is closed
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background Push Received:', payload);

  const notificationTitle = payload.notification?.title || "Vantage AI Homebuyer Sync";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: 'https://www.gstatic.com/images/branding/product/1x/messages_512dp.png',
    badge: 'https://www.gstatic.com/images/branding/product/1x/messages_512dp.png',
    data: {
      targetTab: payload.data?.targetTab || "alerts",
      targetPropertyId: payload.data?.targetPropertyId || ""
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Listener to redirect/deep-link users on click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Construct deep-link landing URL matching client navigation
  const targetTab = event.notification.data?.targetTab || "alerts";
  const propId = event.notification.data?.targetPropertyId || "";
  const targetUrl = `${self.location.origin}/?tab=${targetTab}&propertyId=${propId}`;
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a matching portal tab is already open, focus it
      for (let client of windowClients) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // If no tab is open, open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
