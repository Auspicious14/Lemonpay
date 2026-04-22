import { Stack } from "expo-router";

export default function DisputesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[uuid]" />
      <Stack.Screen name="[uuid]/evidence" />
      <Stack.Screen name="[uuid]/resolved" />
    </Stack>
  );
}
