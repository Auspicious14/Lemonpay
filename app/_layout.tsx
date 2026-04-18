import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as SplashScreenNative from "expo-splash-screen";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from "@expo-google-fonts/inter";
import { Toast } from "@/components/ui/Toast";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { SplashScreen } from "../components/ui/SplashScreen";
import "../styles/global.css";

const queryClient = new QueryClient();

// Keep the native splash screen visible while we fetch fonts
SplashScreenNative.preventAutoHideAsync();

function AppContent() {
  const { isLoading, hasPinSetup } = useAuth();
  const [fontsLoaded, fontError] = useFonts({
    'Inter': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    'Inter-ExtraBold': Inter_800ExtraBold,
    'inter': Inter_400Regular,
    'inter-medium': Inter_500Medium,
    'inter-bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreenNative.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    console.log("[LAYOUT] Waiting for fonts...");
    return null;
  }

  if (isLoading) {
    console.log("[LAYOUT] Showing custom splash screen...");
    return <SplashScreen />;
  }

  console.log("[LAYOUT] Rendering stack...");

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0D1117" },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" options={{ animation: "fade" }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="profile-setup" options={{ presentation: "modal" }} />
      <Stack.Screen name="escrow" options={{ presentation: "card" }} />
      <Stack.Screen name="wallet" options={{ presentation: "card" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BottomSheetModalProvider>
            <StatusBar style="light" />
            <AppContent />
            <Toast />
          </BottomSheetModalProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
