// Listen for push events sent from the backend
self.addEventListener("push", (event) => {
  console.log("Push event received:", event);

  // Extract data from the push event
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Default Title"; // Title of the notification
  const options = {
    body: data.body || "Default body text", // Notification body
    icon: data.icon || "icons/notification-icon.png", // Icon path
    badge: data.badge || "icons/badge-icon.png" // Badge path
  };

  // Display the notification
  event.waitUntil(self.registration.showNotification(title, options));
});

// Listen for notification click events
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event.notification);
  event.notification.close(); // Close the notification

  // Open a specific URL when the notification is clicked
  event.waitUntil(
    clients.openWindow("https://example.com/school-portal")
  );
});
