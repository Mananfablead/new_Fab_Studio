// Test notification function for debugging
export const testNotification = async () => {
  console.log('Testing notification display...');
  console.log('Notification permission:', Notification.permission);

  if (Notification.permission !== 'granted') {
    console.log('Requesting notification permission...');
    const permission = await Notification.requestPermission();
    console.log('Permission result:', permission);
    if (permission !== 'granted') return false;
  }

  try {
    // Prefer Service Worker showNotification — works reliably in Chrome foreground
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification('Test Notification', {
        body: 'This is a test notification to verify display is working',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'test-notification',
        data: { url: window.location.href },
      });
      console.log('Service Worker test notification shown');
      return true;
    }
  } catch (err) {
    console.warn('Service Worker notification failed, falling back:', err);
  }

  // Fallback: direct Notification API
  const notification = new Notification('Test Notification', {
    body: 'This is a test notification to verify display is working',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'test-notification',
  });
  console.log('Fallback notification created:', notification);
  setTimeout(() => notification.close(), 5000);
  notification.onclick = () => { window.focus(); notification.close(); };
  return true;
};

// Add to window for easy testing in console
if (typeof window !== 'undefined') {
  window.testNotification = testNotification;
  console.log('testNotification() function added to window. Call it in console to test.');
}
