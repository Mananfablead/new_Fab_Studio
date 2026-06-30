import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "./config/firebase";
import { toast } from "sonner";

export const requestNotificationPermission = async () => {
  try {
    // Check if Firebase messaging is available
    if (!messaging) {
      console.error("Firebase messaging is not initialized. Please check your Firebase configuration.");
      return null;
    }

    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      console.log("Permission Granted");

      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });

      console.log("FCM TOKEN:", token);

      return token;
    } else {
      console.log("Permission denied");
      return null;
    }
  } catch (error) {
    console.log("Error getting notification permission:", error);
    return null;
  }
};

// Function to show toaster notification
export const showToasterNotification = (title, options = {}) => {
  toast.success(title, {
    description: options.body || "",
    duration: 5000,
    action: options.data?.url ? {
      label: "View",
      onClick: () => {
        window.location.href = options.data.url;
      }
    } : undefined
  });
};

// Function to show browser notification
export const showBrowserNotification = (title, options = {}) => {
  if (Notification.permission === "granted") {
    const notification = new Notification(title, {
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      ...options
    });

    // Auto close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    // Handle click on notification
    notification.onclick = () => {
      window.focus();
      notification.close();
      if (options.data?.url) {
        window.location.href = options.data.url;
      }
    };

    return notification;
  }
  return null;
};

// Function to show both browser and toaster notifications
export const showNotification = (title, options = {}) => {
  // Show browser notification
  showBrowserNotification(title, options);

  // Show toaster notification
  showToasterNotification(title, options);
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) {
      console.error("Firebase messaging is not initialized");
      resolve(null);
      return;
    }

    onMessage(messaging, (payload) => {
      console.log("Foreground message received:", payload);

      // Show both browser and toaster notifications for foreground messages
      const { notification, data } = payload;
      if (notification) {
        showNotification(notification.title || "New Notification", {
          body: notification.body || "You have a new message",
          icon: notification.icon || "/favicon.ico",
          data: data || {}
        });
      }

      resolve(payload);
    });
  });

// Function to send a test notification (for testing purposes)
export const sendTestNotification = () => {
  showNotification("Test Notification", {
    body: "This is a test notification from Fab Studio!",
    icon: "/favicon.ico",
    data: {
      url: "/dashboard"
    }
  });
};

// Function to send OTP notification with auto-fill
export const sendOTPNotification = (otpCode, phoneNumber = "") => {
  const title = "Your FabStudio verification code";
  const body = `Your FabStudio verification code is: ${otpCode}`;

  // Show both browser and toaster notifications
  showNotification(title, {
    body: body,
    icon: "/favicon.ico",
    data: {
      url: "/login",
      otp: otpCode,
      phoneNumber: phoneNumber
    }
  });

  // Extract OTP and store for auto-fill
  const otpMatch = body.match(/\b\d{4,6}\b/);
  if (otpMatch) {
    const extractedOTP = otpMatch[0];
    console.log('Extracted OTP for auto-fill:', extractedOTP);

    // Store OTP in localStorage for auto-fill
    localStorage.setItem('autoFillOTP', extractedOTP);

    // Trigger custom event for immediate auto-fill
    window.dispatchEvent(new CustomEvent('otpAutoFill', {
      detail: { otp: extractedOTP }
    }));
  }
};
