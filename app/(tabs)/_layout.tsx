import React from "react";
import { Tabs } from "expo-router";
import { Home, ArrowRightLeft, Wallet, User } from "lucide-react-native";

const LEMON_YELLOW = "#F5E642";
const DARK_BG = "#0D1117";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: DARK_BG,
          borderTopColor: "#161B22",
          height: 85,
          paddingTop: 10,
        },
        tabBarActiveTintColor: LEMON_YELLOW,
        tabBarInactiveTintColor: "#94A3B8",
        tabBarLabelStyle: {
          fontFamily: "Inter-Medium",
          fontSize: 12,
          marginBottom: 10,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="escrows"
        options={{
          title: "Escrows",
          tabBarIcon: ({ color }) => <ArrowRightLeft size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          tabBarIcon: ({ color }) => <Wallet size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
