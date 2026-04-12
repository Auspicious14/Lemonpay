import React, { useState } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import {
  Mail,
  ArrowLeft,
  ChevronRight,
  LockKeyhole,
} from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { apiClient } from "@/lib/api/client";
import { Toast } from "@/components/ui/Toast";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email) {
      Toast.show({ message: "Please enter your email", type: "error" });
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post("/auth/forgot-password", { email });
      Toast.show({ message: "Reset code sent!", type: "success" });
      router.push({
        pathname: "/(auth)/forgot-password/verify",
        params: { email },
      });
    } catch (error: any) {
      Toast.show({
        message: error.response?.data?.message || "Failed to send reset code",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen showBackButton title="SECURITY GATE" className="bg-surface">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="items-center justify-center pt-10 pb-8">
          {/* Hero Icon */}
          <View className="relative">
            <View className="absolute inset-0 bg-primary-fixed blur-[40px] opacity-10 rounded-full" />
            <Card
              variant="high"
              className="p-8 rounded-[32px] border border-outline-variant/10"
            >
              <LockKeyhole size={56} color="#f5e642" strokeWidth={1.5} />
            </Card>
          </View>
        </View>

        <View className="text-center items-center mb-10 px-4">
          <Typography variant="display" className="text-center mb-3">
            Reset Password Access
          </Typography>
          <Typography
            variant="body"
            className="text-text-secondary text-center max-w-[280px]"
          >
            Enter your registered email and we'll send a security code to
            recover your account.
          </Typography>
        </View>

        <View className="space-y-6">
          <Input
            label="Email Address"
            placeholder="name@example.com"
            leftIcon={<Mail size={20} color="#95917a" />}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Button
            label="Send Security Code"
            onPress={handleSendCode}
            loading={isLoading}
            rightIcon={<ChevronRight size={20} color="#1f1c00" />}
            className="shadow-2xl shadow-primary-fixed/20"
          />
        </View>

        <View className="mt-12 items-center">
          <TouchableOpacity
            className="flex-row items-center space-x-2"
            onPress={() => router.back()}
          >
            <ArrowLeft size={16} color="#ccc7ad" />
            <Typography
              variant="body"
              className="text-text-secondary font-inter-semibold"
            >
              Back to Secure Login
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Trust Indicators */}
        <View className="mt-20 items-center opacity-40">
          <View className="h-[1px] w-12 bg-outline-variant/30 mb-8" />
          <View className="flex-row space-x-8">
            <View className="flex-row items-center space-x-2">
              <Shield size={12} color="#ffffff" />
              <Typography variant="label-sm">256-bit AES</Typography>
            </View>
            <View className="flex-row items-center space-x-2">
              <Lock size={12} color="#ffffff" />
              <Typography variant="label-sm">Encrypted</Typography>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Decorative Background */}
      <View
        className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-fixed/5 rounded-full"
        pointerEvents="none"
        style={{ filter: "blur(120px)" }}
      />
    </Screen>
  );
}

// Simple Shield/Lock icons for placeholder if lucide-react-native doesn't have exact ones
const Shield = ({ size, color }: { size: number; color: string }) => (
  <View
    style={{
      width: size,
      height: size,
      backgroundColor: color,
      borderRadius: 2,
    }}
  />
);
const Lock = ({ size, color }: { size: number; color: string }) => (
  <View
    style={{
      width: size,
      height: size,
      backgroundColor: color,
      borderRadius: 2,
    }}
  />
);
