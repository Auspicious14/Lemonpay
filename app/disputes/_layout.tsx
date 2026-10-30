import { Stack } from "expo-router";

export default function DisputesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[uuid]" />
    </Stack>
  );
}
