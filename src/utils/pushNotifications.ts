export interface PushNotificationPayload {
  title: string;
  body: string;
  targetTab: string;
  targetLeadId?: string;
  targetPropertyId?: string;
}

export const sendRealTimePushNotification = (payload: PushNotificationPayload) => {
  // Dispatch custom event for deep link navigation (this triggers our in-app logic)
  const dispatchNavEvent = () => {
    window.dispatchEvent(new CustomEvent("DEEP_LINK_NAV", { detail: payload }));
  };

  // Dispatch toast for visual feedback in-app
  window.dispatchEvent(new CustomEvent("APP_TOAST", { 
    detail: { message: `\${payload.title} — \${payload.body}` } 
  }));

  // Browser Notification API
  if ("Notification" in window) {
    if (Notification.permission === "granted") {
      const notif = new Notification(payload.title, {
        body: payload.body,
        icon: "https://www.gstatic.com/images/branding/product/1x/messages_512dp.png", // generic messaging icon
      });
      notif.onclick = () => {
        window.focus();
        dispatchNavEvent();
        notif.close();
      };
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          // retry once granted
          sendRealTimePushNotification(payload);
        }
      });
    }
  }
};
