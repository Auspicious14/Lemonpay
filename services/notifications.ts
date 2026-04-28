import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

// Configure how notifications are presented when the app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const notificationService = {
  /**
   * Request permissions and register the device for push notifications.
   * On success, sends the Expo push token to the backend.
   */
  registerForPushNotificationsAsync: async (): Promise<string | null> => {
    if (!Device.isDevice) {
      console.log("[PUSH] Skipped — not a physical device");
      return null;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("[PUSH] Permission not granted");
      return null;
    }

    const projectId = (Constants.expoConfig?.extra as any)?.eas?.projectId as
      | string
      | undefined;

    const token = (await Notifications.getExpoPushTokenAsync({ projectId }))
      .data;
    console.log("[PUSH TOKEN]", token);

    try {
      await apiClient.post(ENDPOINTS.USER.PUSH_TOKEN, { token });
      console.log("[PUSH TOKEN] saved to backend");
    } catch (e) {
      console.log("[PUSH TOKEN SAVE FAILED]", e);
    }

    return token;
  },

  /**
   * Register foreground + tap listeners.
   * Returns a cleanup function to be called on unmount.
   */
  setupListeners: (
    onReceive: (n: Notifications.Notification) => void,
    onTap: (r: Notifications.NotificationResponse) => void,
  ): (() => void) => {
    const sub1 = Notifications.addNotificationReceivedListener(onReceive);
    const sub2 = Notifications.addNotificationResponseReceivedListener(onTap);

    return () => {
      sub1.remove();
      sub2.remove();
    };
  },

  /**
   * Fire an immediate local notification (trigger: null = instant).
   */
  scheduleLocal: async (
    title: string,
    body: string,
    data: Record<string, any> = {},
  ): Promise<void> => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: { title, body, data },
        trigger: null,
      });
      console.log("[LOCAL NOTIF]", title, body, data);
    } catch (e) {
      console.log("[LOCAL NOTIF FAILED]", e);
    }
  },
};
