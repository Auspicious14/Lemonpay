import { Stack } from "expo-router";

export default function EscrowLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0D1117" },
        animation: "slide_from_right",
      }}
    />
  );
}
