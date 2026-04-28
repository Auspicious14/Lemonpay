import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

const PROJECT_ID = "fca9e55c-7ece-4873-b6ac-20648c5fcc91";

// ─── Foreground notification handler ─────────────────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async (): Promise<Notifications.NotificationBehavior> => {
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    };
  },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** True when running inside Expo Go (where push is removed in SDK 53+) */
const isExpoGo = (): boolean => (Constants as any).appOwnership === "expo";

/** True only on a real physical device */
const isPhysicalDevice = (): boolean => !!Device.isDevice;

// ─── Service ─────────────────────────────────────────────────────────────────
export const notificationService = {
  /**
   * Request permission and register the Expo push token with the backend.
   * - Skips in Expo Go (SDK 53 removed remote push from Expo Go)
   * - Skips on simulators / emulators
   */
  registerForPushNotificationsAsync: async (): Promise<string | null> => {
    if (isExpoGo()) {
      console.log("[PUSH] Skipped — Expo Go does not support push in SDK 53+");
      return null;
    }

    if (!isPhysicalDevice()) {
      console.log("[PUSH] Skipped — not a physical device");
      return null;
    }

    // Android: ensure a notification channel exists
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "LymePay Notifications",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#F5E642",
      });
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("[PUSH] Permission not granted — status:", finalStatus);
      return null;
    }

    // Resolve projectId: prefer runtime config, fall back to hardcoded
    const projectId: string =
      (Constants.expoConfig?.extra as any)?.eas?.projectId ?? PROJECT_ID;

    console.log("[PUSH] Using projectId:", projectId);

    let token: string;
    try {
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log("[PUSH TOKEN]", token);
    } catch (e) {
      console.log("[PUSH TOKEN GET FAILED]", e);
      return null;
    }

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
   * Returns a cleanup function — call it in useEffect's return.
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
   * Fire an immediate local notification (works in Expo Go too).
   * trigger: null = fire instantly.
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
      console.log("[LOCAL NOTIF]", title, "|", body, "|", data);
    } catch (e) {
      console.log("[LOCAL NOTIF FAILED]", e);
    }
  },
};
