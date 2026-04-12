import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const KEYS = {
  TOKEN: "lemonpay_access_token",
  REFRESH_TOKEN: "lemonpay_refresh_token",
  HAS_LAUNCHED: "lemonpay_has_launched",
  PIN_SETUP: "lemonpay_pin_setup",
  SAVED_EMAIL: "lemonpay_saved_email",
};

export const TokenStorage = {
  async setToken(token: string) {
    try {
      if (Platform.OS === "web") {
        await AsyncStorage.setItem(KEYS.TOKEN, token);
      } else {
        await SecureStore.setItemAsync(KEYS.TOKEN, token);
      }
    } catch (e) {
      console.error("[STORAGE] Error setting token", e);
    }
  },

  async getToken() {
    try {
      if (Platform.OS === "web") {
        return await AsyncStorage.getItem(KEYS.TOKEN);
      }
      return await SecureStore.getItemAsync(KEYS.TOKEN);
    } catch (e) {
      return null;
    }
  },

  async clearToken() {
    try {
      if (Platform.OS === "web") {
        await AsyncStorage.removeItem(KEYS.TOKEN);
      } else {
        await SecureStore.deleteItemAsync(KEYS.TOKEN);
      }
    } catch (e) {
      console.error("[STORAGE] Error clearing token", e);
    }
  },

  async setRefreshToken(token: string) {
    try {
      if (Platform.OS === "web") {
        await AsyncStorage.setItem(KEYS.REFRESH_TOKEN, token);
      } else {
        await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, token);
      }
    } catch (e) {
      console.error("[STORAGE] Error setting refresh token", e);
    }
  },

  async getRefreshToken() {
    try {
      if (Platform.OS === "web") {
        return await AsyncStorage.getItem(KEYS.REFRESH_TOKEN);
      }
      return await SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
    } catch (e) {
      return null;
    }
  },

  async clearRefreshToken() {
    try {
      if (Platform.OS === "web") {
        await AsyncStorage.removeItem(KEYS.REFRESH_TOKEN);
      } else {
        await SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN);
      }
    } catch (e) {
      console.error("[STORAGE] Error clearing refresh token", e);
    }
  },

  async setHasLaunched(value: boolean) {
    try {
      await AsyncStorage.setItem(KEYS.HAS_LAUNCHED, JSON.stringify(value));
    } catch (e) {
      console.error("[STORAGE] Error setting hasLaunched", e);
    }
  },

  async getHasLaunched(): Promise<boolean | null> {
    try {
      const val = await AsyncStorage.getItem(KEYS.HAS_LAUNCHED);
      return val ? JSON.parse(val) : null;
    } catch (e) {
      return null;
    }
  },

  async getPinSetup(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(KEYS.PIN_SETUP);
    } catch (e) {
      return null;
    }
  },

  async setPinSetup(): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.PIN_SETUP, "true");
    } catch (e) {
      console.error("[STORAGE] Error setting pinSetup", e);
    }
  },

  async getSavedEmail(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(KEYS.SAVED_EMAIL);
    } catch (e) {
      return null;
    }
  },

  async setSavedEmail(email: string): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.SAVED_EMAIL, email);
    } catch (e) {
      console.error("[STORAGE] Error setting savedEmail", e);
    }
  },

  async clearAll() {
    await this.clearToken();
    await this.clearRefreshToken();
    // Note: We don't usually clear hasLaunched or pinSetup on logout
  },
};
