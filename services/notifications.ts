import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import apiClient from "@/lib/api/client";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PROJECT_ID = "fca9e55c-7ece-4873-b6ac-20648c5fcc91";

// Foreground notification handler
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

const isExpoGo = (): boolean => (Constants as any).appOwnership === "expo";
const isPhysicalDevice = (): boolean => !!Device.isDevice;

export const notificationService = {
  registerForPushNotificationsAsync: async (): Promise<string | null> => {
    try {
      if (isExpoGo()) {
        console.log(
          "[PUSH] Skipped — Expo Go does not support push in SDK 53+",
        );
        return null;
      }

      if (!isPhysicalDevice()) {
        console.log("[PUSH] Skipped — not a physical device");
        return null;
      }

      // Android: ensure a notification channel exists
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "LymPay Notifications",
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

      const projectId: string =
        (Constants.expoConfig?.extra as any)?.eas?.projectId ?? PROJECT_ID;

      const token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;

      console.log("[PUSH] Token:", token);

      // NEW endpoint: POST /device-tokens
      try {
        await apiClient.post("/device-tokens", {
          token,
          platform: Platform.OS, // "android" or "ios"
        });
        console.log("[PUSH] Token registered at /device-tokens");
      } catch (err: any) {
        console.log("[PUSH] Backend registration failed:", err.message);
      }

      await AsyncStorage.setItem("lympay_push_token", token);
      return token;
    } catch (error: any) {
      console.log("[PUSH] Setup failed:", error.message);
      return null;
    }
  },

  // Add deregister method for logout
  deregisterPushToken: async (token: string): Promise<void> => {
    try {
      await apiClient.delete("/device-tokens", {
        data: { token },
      });
      console.log("[PUSH] Token deregistered");
      await AsyncStorage.removeItem("lympay_push_token");
    } catch (err: any) {
      console.log("[PUSH] Deregister failed:", err.message);
    }
  },

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
