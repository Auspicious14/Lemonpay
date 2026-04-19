import { Stack } from "expo-router";
import { useEffect } from "react";
import * as WebBrowser from "expo-web-browser";

export default function WalletLayout() {
  useEffect(() => {
    // Required for expo-web-browser to handle redirects
    WebBrowser.maybeCompleteAuthSession();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#0D1117" },
      }}
    >
      <Stack.Screen name="fund" />
      <Stack.Screen name="bank-transfer" />
      <Stack.Screen name="history" />
      <Stack.Screen name="withdraw" />
      <Stack.Screen name="withdraw-review" />
      <Stack.Screen name="withdraw-success" />
    </Stack>
  );
}
