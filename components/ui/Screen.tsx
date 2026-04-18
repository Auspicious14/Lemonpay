import React from "react";
import { View, TouchableOpacity, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Typography } from "./Typography";

interface ScreenProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  className?: string;
  withPadding?: boolean;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  title,
  showBackButton = false,
  onBack,
  rightAction,
  className = "",
  withPadding = true,
}) => {
  const router = useRouter();

  return (
    <SafeAreaView
      className="flex-1 bg-[#0D1117]"
      edges={["top", "left", "right"]}
    >
      <StatusBar style="light" />

      {(title || showBackButton || rightAction) && (
        <View className="flex-row items-center justify-between px-6 py-4 h-16">
          <View className="flex-row items-center flex-1">
            {showBackButton && (
              <TouchableOpacity
                onPress={onBack || (() => router.back())}
                className="mr-4 w-10 h-10 items-center justify-center bg-[#1C2026] rounded-xl border border-[#30363D]"
              >
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={22}
                  color="#ffffff"
                />
              </TouchableOpacity>
            )}
            {title && (
              <Typography
                variant="heading"
                className="flex-1 text-white"
                numberOfLines={1}
                weight="700"
              >
                {title}
              </Typography>
            )}
          </View>

          {rightAction && <View className="ml-2">{rightAction}</View>}
        </View>
      )}

      <View className={`flex-1 ${withPadding ? "px-6" : ""} ${className}`}>
        {children}
      </View>
    </SafeAreaView>
  );
};
