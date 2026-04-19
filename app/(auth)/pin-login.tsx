import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/ui/Screen";
import { Typography } from "@/components/ui/Typography";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { OtpInput } from "@/components/ui/OtpInput";
import { usePinLogin } from "@/lib/hooks/useAuthMutations";
import { TokenStorage } from "@/lib/storage";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

export default function PinLoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const { mutate: pinLogin, isPending, error } = usePinLogin();

  useEffect(() => {
    const fetchEmail = async () => {
      const savedEmail = await TokenStorage.getSavedEmail();
      if (savedEmail) setEmail(savedEmail);
    };
    fetchEmail();
  }, []);

  const handleLogin = () => {
    if (!email || pin.length !== 4) return;
    pinLogin({ email, pin });
  };

  return (
    <Screen>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
          <TouchableOpacity
            onPress={() => router.replace("/(auth)/login")}
            className="w-10 h-10 items-center justify-center bg-secondary/10 rounded-full mb-8"
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>

          <View className="mb-12">
            <Typography
              variant="display"
              weight="700"
              className="text-white mb-2"
            >
              Login with PIN
            </Typography>
            <Typography variant="body" className="text-white/60">
              Enter your secure 4-digit code to continue.
            </Typography>
          </View>

          <View style={{gap:6}}>
            <Typography variant="label-sm" className="text-[#8B949E]">Email Address</Typography>
            <TextInput
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View>
              <Typography
                variant="label"
                className="!text-white/60 mb-4 text-center"
              >
                Enter your 4-digit PIN
              </Typography>
              <OtpInput length={4} value={pin} onChange={setPin} obscure />
            </View>

            {error && (
              <Typography
                variant="caption"
                className="text-red-500 text-center"
              >
                {(error as any).response?.data?.message ??
                  "Invalid PIN or email"}
              </Typography>
            )}

            <Button
              label="Login"
              onPress={handleLogin}
              loading={isPending}
              disabled={!email || pin.length !== 4 || isPending}
              className="mt-4"
            />

            <TouchableOpacity
              onPress={() => router.replace("/(auth)/login")}
              className="items-center mt-4"
            >
              <Typography
                variant="caption"
                weight="600"
                className="text-primary"
              >
                Use OTP instead
              </Typography>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
