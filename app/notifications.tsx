import React, { useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import {
  Bell,
  ShieldCheck,
  Gavel,
  Wallet,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react-native";
import {
  useNotifications,
  useMarkNotificationRead,
} from "@/lib/hooks/useNotifications";
import { Notification } from "@/types/api";
import { formatDate } from "@/lib/utils/format";

// Icon per notification type
const NotifIcon = ({ type }: { type: string }) => {
  const size = 20;
  if (type.includes("escrow")) {
    if (type.includes("dispute")) return <Gavel size={size} color="#FF4D4F" />;
    if (type.includes("funded")) return <Wallet size={size} color="#3b82f6" />;
    if (type.includes("released"))
      return <CheckCircle2 size={size} color="#00C896" />;
    if (type === "escrow_locked")
      return <ShieldCheck size={size} color="#F5E642" />;
    return <ShieldCheck size={size} color="#F5E642" />;
  }
  if (type.includes("dispute")) return <Gavel size={size} color="#FF4D4F" />;
  if (type.includes("warning"))
    return <AlertTriangle size={size} color="#FF8C00" />;
  return <Info size={size} color="#8B949E" />;
};

const iconBg = (type: string): string => {
  if (type.includes("dispute")) return "#FF4D4F20";
  if (type.includes("funded")) return "#3b82f620";
  if (type.includes("released")) return "#00C89620";
  if (type === "escrow_locked") return "#F5E64220";
  if (type.includes("escrow")) return "#F5E64215";
  return "#30363D";
};

export default function NotificationsScreen() {
  const router = useRouter();
  const {
    data: notifications = [],
    isLoading,
    refetch,
    isRefetching,
  } = useNotifications();
  const markRead = useMarkNotificationRead();

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleTap = (notif: Notification) => {
    // Mark read
    if (!notif.read_at) {
      markRead.mutate(notif.id);
    }

    // Navigate based on data embedded in notification
    const d = notif.data || {};
    if (d.escrow_uuid) {
      router.push(`/escrow/${d.escrow_uuid}`);
      return;
    }
    if (d.dispute_uuid) {
      router.push(`/disputes/${d.dispute_uuid}`);
      return;
    }
  };

  const renderItem = ({ item }: { item: Notification }) => {
    const isUnread = !item.read_at;
    const notifType: string = item.type ?? "info";
    const title: string =
      item.data?.title ??
      notifType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const body: string = item.data?.body ?? item.data?.message ?? "";

    return (
      <TouchableOpacity
        onPress={() => handleTap(item)}
        activeOpacity={0.75}
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          padding: 16,
          backgroundColor: isUnread ? "#1C2230" : "#161B22",
          borderRadius: 16,
          marginBottom: 10,
          borderWidth: 1,
          borderColor: isUnread ? "#F5E64220" : "#30363D",
        }}
      >
        {/* Left Icon */}
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: iconBg(notifType),
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <NotifIcon type={notifType} />
        </View>

        {/* Content */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: "Inter-Bold",
              color: "white",
              fontSize: 14,
              marginBottom: 3,
            }}
            numberOfLines={1}
          >
            {title}
          </Text>
          {!!body && (
            <Text
              style={{
                fontFamily: "Inter",
                color: "#8B949E",
                fontSize: 12,
                lineHeight: 18,
              }}
              numberOfLines={2}
            >
              {body}
            </Text>
          )}
          <Text
            style={{
              fontFamily: "Inter",
              color: "#484f58",
              fontSize: 10,
              marginTop: 6,
            }}
          >
            {formatDate(item.created_at)}
          </Text>
        </View>

        {/* Unread dot */}
        {isUnread && (
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: "#FF4D4F",
              marginLeft: 8,
              marginTop: 4,
            }}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#0D1117" }}
      edges={["top", "left", "right"]}
    >
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 24,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#1C2026",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: "#1C2026",
            borderWidth: 1,
            borderColor: "#30363D",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <ArrowLeft size={20} color="white" />
        </TouchableOpacity>
        <Text
          style={{
            fontFamily: "Inter-Bold",
            color: "white",
            fontSize: 18,
            flex: 1,
          }}
        >
          Notifications
        </Text>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: "#1C2026",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Bell size={18} color="#F5E642" />
        </View>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            tintColor="#F5E642"
          />
        }
        ListEmptyComponent={
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 80,
            }}
          >
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: "#161B22",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
                borderWidth: 1,
                borderColor: "#30363D",
              }}
            >
              <Bell size={32} color="#30363D" />
            </View>
            <Text
              style={{
                fontFamily: "Inter-Bold",
                color: "white",
                fontSize: 18,
                marginBottom: 8,
              }}
            >
              No notifications yet
            </Text>
            <Text
              style={{
                fontFamily: "Inter",
                color: "#8B949E",
                fontSize: 14,
                textAlign: "center",
              }}
            >
              You'll see escrow updates and alerts here.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
