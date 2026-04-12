import React, { useEffect, useRef } from "react";
import { Animated, View, StyleSheet, Dimensions, Platform } from "react-native";
import { useToastStore, ToastType } from "@/store/useToastStore";
import { Typography } from "./Typography";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

const { width } = Dimensions.get("window");

const typeConfig: Record<ToastType, { color: string; icon: string }> = {
  success: {
    color: "#01c896",
    icon: "checkmark-circle",
  },
  error: {
    color: "#ffb4ab",
    icon: "alert-circle",
  },
  warning: {
    color: "#f5e642",
    icon: "warning",
  },
  info: {
    color: "#b1c5ff",
    icon: "information-circle",
  },
};

const ToastComponent: React.FC = () => {
  const { toast, hide } = useToastStore();
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (toast) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 10,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 100,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => hide());
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!toast) return null;

  const config = typeConfig[toast.type];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <BlurView
        intensity={Platform.OS === "ios" ? 40 : 100}
        tint="dark"
        style={styles.blurContainer}
      >
        <View style={[styles.indicator, { backgroundColor: config.color }]} />
        <View style={styles.content}>
          <View
            style={[styles.iconBox, { backgroundColor: `${config.color}20` }]}
          >
            <Ionicons
              name={config.icon as any}
              size={20}
              color={config.color}
            />
          </View>
          <Typography style={styles.message} numberOfLines={2}>
            {toast.message}
          </Typography>
        </View>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 50 : 30,
    left: 20,
    right: 20,
    zIndex: 9999,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  blurContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "rgba(16, 20, 26, 0.8)",
  },
  indicator: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  message: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
});

export const Toast = Object.assign(ToastComponent, {
  show: (options: { message: string; type?: ToastType }) => {
    useToastStore.getState().show(options.message, options.type);
  },
});
