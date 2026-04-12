import React from "react";
import { Tabs } from "expo-router";
import { LayoutGrid, Wallet, Scale, Settings } from "lucide-react-native";
import { View, Text } from "react-native";

const LEMON_YELLOW = "#F5E642";
const DARK_BG = "#161B22";
const INACTIVE_COLOR = "#8B949E";
const BORDER_COLOR = "#30363D";

interface TabIconProps {
  Icon: any;
  focused: boolean;
  color: string;
}

const TabIcon = ({ Icon, focused, color }: TabIconProps) => {
  return (
    <View
      className={`items-center justify-center rounded-full w-12 h-8 ${
        focused ? "bg-accent-primary/20" : ""
      }`}
    >
      <Icon size={20} color={color} />
    </View>
  );
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: DARK_BG,
          borderTopColor: BORDER_COLOR,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: LEMON_YELLOW,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarLabelStyle: {
          fontFamily: "Inter-Bold",
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: 1,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon Icon={LayoutGrid} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon Icon={Wallet} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="escrows"
        options={{
          title: "Escrows",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon Icon={Scale} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Security",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon Icon={Settings} focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
