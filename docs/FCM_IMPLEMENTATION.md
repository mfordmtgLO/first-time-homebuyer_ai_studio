# Firebase Cloud Messaging (FCM) Integration Guide

This document outlines the architecture, step-by-step installation, client permission flows, and server-side execution required to trigger background mobile push notifications on locked phones using **Firebase Cloud Messaging (FCM)**.

With this setup, when background cron jobs (e.g., Zillow price check or rate trend calibration) run on the backend, price drop alerts and DTI budget expansion updates are delivered directly to the user's locked mobile screen.

---

## 1. Architectural Overview

```
 [Buyer Device (foreground/locked)]             [Background Node.js Cron]
         |                                                 |
         |--- 1. Authorize & Get FCM Token ---->           |
         |                                    |            |
         |<-- 2. Store token in Firestore -----            |
         |      Collection: /leads/{leadId}                |
         |                                                 |
         |                                                 |--- 3. Detects Price Drop ---
         |                                                 |    Reads lead.fcmToken
         |                                                 |    from /leads/{leadId}
         |                                                 |
         |<-- 4. Dispatched FCM Push payload --------------|
         |      Display via Service Worker:
         |      firebase-messaging-sw.js
```

Foreground notifications using standard browser APIs (`new Notification()`) fail silently when a device is locked or the application is in the background. By implementing the **W3C Web Push Protocol** through Firebase Cloud Messaging (FCM):
1. The user registers a persistent Service Worker on their mobile system.
2. The browser grants a cryptographic `fcmToken` uniquely identifying that device.
3. The backend Admin SDK targets this token to push system notifications securely.
4. The Service Worker catches the payload in the background and renders a system notification with customized click actions.

---

## 2. Client-Side Integration

### Step 1: Initialize FCM in `src/firebase.ts`
Add the messaging module to your client Firebase configuration:

```typescript
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging } from 'firebase/messaging';
import firebaseConfig from '../firebase-applet-config.json';

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// FCM Client Instance (runs only on client-side window context)
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;
```

---

### Step 2: Request Permissions & Retrieve FCM Tokens
Retrieve the token at **Soft-Ask time** (e.g., when the buyer favorites their first property, completes the intake chatbot, or selects the push notification authorization toggle).

Create a utility module `src/utils/fcmTokenManager.ts`:

```typescript
import { messaging, db } from "../firebase";
import { getToken } from "firebase/messaging";
import { doc, setDoc } from "firebase/firestore";

const VAPID_PUBLIC_KEY = "BF_Your_Vapid_Public_Key_Here_Change_This";

/**
 * Prompts the buyer for system notification permissions,
 * requests an FCM device token, and persists it in their sharded Firestore lead document.
 */
export async function requestAndSaveFCMToken(leadId: string) {
  if (typeof window === "undefined" || !("Notification" in window)) {
    console.warn("Notifications are not supported on this browser/device.");
    return null;
  }

  if (!messaging) {
    console.warn("Firebase Messaging is not initialized.");
    return null;
  }

  try {
    // 1. Request native OS permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Buyer declined push notification permissions.");
      return null;
    }

    // 2. Fetch the FCM token from Google's gateway
    const fcmToken = await getToken(messaging, { vapidKey: VAPID_PUBLIC_KEY });
    
    if (fcmToken) {
      console.log("Cryptographic FCM Device Token generated:", fcmToken);

      // 3. Persist the token to the sharded /leads/{leadId} document in Firestore
      const leadRef = doc(db, "leads", leadId);
      await setDoc(leadRef, { 
        fcmToken: fcmToken,
        pushAlertsEnabled: true,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      return fcmToken;
    } else {
      console.warn("No instance ID token available. Request permission again or verify VAPID key.");
      return null;
    }
  } catch (error) {
    console.error("An error occurred while retrieving FCM token:", error);
    return null;
  }
}
```

---

### Step 3: Register the Service Worker (`firebase-messaging-sw.js`)
Create a dedicated file in the web root `/public/firebase-messaging-sw.js` (Vite copies this directly to `dist/` upon build). This script handles events in the operating system's background:

```javascript
// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Must match your exact firebase-applet-config.json
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

  const notificationTitle = payload.notification.title || "Vantage AI Homebuyer Sync";
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'https://www.gstatic.com/images/branding/product/1x/messages_512dp.png',
    badge: '/badge_icon.png',
    data: {
      targetTab: payload.data?.targetTab || "alerts",
      targetPropertyId: payload.data?.targetPropertyId
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
```

---

## 3. Server-Side Execution

When background cron loops detect Zillow price drops or mortgage rate contractions, the backend system fetches the individual lead profile, grabs the `fcmToken`, and broadcasts the push frame.

### Background Dispatch Code (Node.js/Express)
Add this logic in `server.ts` or your automated scheduler worker:

```typescript
import * as admin from 'firebase-admin';

// Initialize Admin SDK (assumes credentials configured via environment)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
}

interface PushAlertParams {
  fcmToken: string;
  title: string;
  body: string;
  targetPropertyId?: string;
  targetTab?: "alerts" | "geomap" | "prequal";
}

/**
 * Dispatches a native mobile background notification via Firebase Cloud Messaging REST API.
 */
export async function sendBackgroundPushAlert(params: PushAlertParams) {
  const { fcmToken, title, body, targetPropertyId, targetTab = "alerts" } = params;

  const payload = {
    notification: {
      title: title,
      body: body,
    },
    data: {
      targetTab: targetTab,
      targetPropertyId: targetPropertyId || "",
    },
    // Required APNS & Web configurations for mobile OS background rendering
    webpush: {
      headers: {
        Urgency: "high",
      },
      notification: {
        icon: "https://www.gstatic.com/images/branding/product/1x/messages_512dp.png",
        badge: "https://www.gstatic.com/images/branding/product/1x/messages_512dp.png",
        requireInteraction: true,
      }
    },
    token: fcmToken,
  };

  try {
    const response = await admin.messaging().send(payload);
    console.log(`FCM Background Push successfully routed:`, response);
    return { success: true, messageId: response };
  } catch (error: any) {
    console.error("FCM background push routing failed:", error);
    
    // Self-Healing Hook: Strip stale FCM tokens if they are unregistered/expired
    if (error.code === 'messaging/registration-token-not-registered' || 
        (error.message && error.message.includes('not registered'))) {
      console.log(`Stale FCM token detected. Stripping from Firestore lead records...`);
      // Update the sharded lead doc to remove the stale FCM token
      await admin.firestore().collection('leads').where('fcmToken', '==', fcmToken)
        .get()
        .then((snap) => {
          snap.forEach((doc) => {
            doc.ref.update({ fcmToken: admin.firestore.FieldValue.delete() });
          });
        });
    }
    
    return { success: false, error: error };
  }
}
```

---

## 4. Testing & Verification

### Local Testing Steps:
1. Access the application over a secure connection (HTTPS) or `localhost:3000`.
2. Register as a new lead in the chatbot or favorite a property listing card to prompt the soft-ask toggle.
3. Grant notification permissions in your browser.
4. Copy the generated `fcmToken` printed to the browser developer console (or check the sharded `/leads/{leadId}` document in your Firestore Emulator/Console).
5. Open your Terminal and execute a test curl command targeting FCM's v1 gateway to see the locked mobile screen immediately flash the alert card:

```bash
curl -X POST -H "Authorization: Bearer YOUR_OAUTH2_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "message": {
         "token": "YOUR_COPIED_FCM_TOKEN",
         "notification": {
           "title": "🔥 Zillow Price Drop Detected!",
           "body": "Your favorite Portland home dropped by $15,000! Tap to view your new prequal headroom."
         },
         "data": {
           "targetTab": "alerts"
         }
       }
     }' \
     https://fcm.googleapis.com/fcm/send
```
