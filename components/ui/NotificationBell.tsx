import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Bell } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useUnreadNotificationCount } from "@/lib/hooks/useNotifications";

interface NotificationBellProps {
  color?: string;
  size?: number;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  color = "white",
  size = 22,
}) => {
  const router = useRouter();
  const unreadCount = useUnreadNotificationCount();
  const badgeLabel = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <TouchableOpacity
      onPress={() => router.push("/notifications")}
      style={{
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
      }}
      accessibilityLabel="Notifications"
      accessibilityRole="button"
    >
      <Bell size={size} color={color} />
      {unreadCount > 0 && (
        <View
          style={{
            position: "absolute",
            top: 2,
            right: 2,
            backgroundColor: "#FF4D4F",
            borderRadius: 10,
            minWidth: 16,
            height: 16,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 3,
            borderWidth: 1.5,
            borderColor: "#0D1117",
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 8,
              fontFamily: "Inter-Bold",
              lineHeight: 12,
            }}
          >
            {badgeLabel}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
