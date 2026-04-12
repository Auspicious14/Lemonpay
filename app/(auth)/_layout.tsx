import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function AuthLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="register" />
        <Stack.Screen name="account-type" />
        <Stack.Screen name="verify-otp" />
        <Stack.Screen name="login" />
      </Stack>
    </>
  );
}
