import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { Shield, Timer, HelpCircle } from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const { width } = Dimensions.get("window");

export default function VerifyOtpForgotPasswordScreen() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const handleVerify = () => {
    // TODO: Verify OTP API
    router.push("/(auth)/forgot-password/reset");
  };

  return (
    <Screen showBackButton title="SECURITY GATE" className="bg-surface">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="space-y-10 pt-10">
          <View className="space-y-4">
            <Typography variant="display-lg" className="leading-none">
              Verify {"\n"}Access
            </Typography>
            <Typography variant="body" className="text-text-secondary max-w-md">
              A 6-digit code has been sent to{" "}
              <Typography className="text-primary-fixed font-bold">
                j***@email.com
              </Typography>
              . Please enter it below.
            </Typography>
          </View>

          <Card
            variant="default"
            className="p-8 rounded-[40px] border border-outline-variant/10 relative"
          >
            <View className="absolute -top-6 -right-6 w-12 h-12 bg-primary-fixed rounded-xl items-center justify-center shadow-lg">
              <Shield size={24} color="#1f1c00" fill="#1f1c00" />
            </View>

            <View className="flex-row justify-between mb-10">
              {otp.map((val, i) => (
                <View
                  key={i}
                  className="w-[14%] aspect-square bg-surface-container-highest rounded-2xl items-center justify-center border border-transparent focus:border-primary-fixed"
                >
                  <Typography variant="heading" className="text-primary-fixed">
                    {val || "•"}
                  </Typography>
                </View>
              ))}
            </View>

            <View className="space-y-6">
              <Button
                label="Verify & Continue"
                onPress={handleVerify}
                className="bg-primary-fixed"
              />

              <View className="items-center space-y-4">
                <View className="h-[2px] w-12 bg-outline-variant/30 rounded-full" />
                <Typography
                  variant="body"
                  className="text-sm text-text-secondary"
                >
                  Didn't receive the code?
                  <TouchableOpacity>
                    <Typography className="text-secondary font-bold ml-1">
                      Resend code
                    </Typography>
                  </TouchableOpacity>
                </Typography>

                <View className="flex-row items-center space-x-2 px-4 py-2 bg-surface-container-high rounded-full">
                  <Timer size={14} color="#f5e642" />
                  <Typography variant="label-sm" className="text-primary-fixed">
                    00:59
                  </Typography>
                </View>
              </View>
            </View>
          </Card>

          <View className="space-y-4">
            <Card
              variant="low"
              className="flex-row items-center space-x-4 border border-outline-variant/5"
            >
              <View className="w-10 h-10 rounded-full bg-secondary/10 items-center justify-center">
                <Shield size={20} color="#43e5b1" />
              </View>
              <View>
                <Typography variant="label-sm" className="text-text-secondary">
                  Secure Session
                </Typography>
                <Typography variant="caption" className="opacity-60">
                  End-to-end encrypted verification
                </Typography>
              </View>
            </Card>

            <Card
              variant="low"
              className="flex-row items-center space-x-4 border border-outline-variant/5"
            >
              <View className="w-10 h-10 rounded-full bg-primary-fixed/10 items-center justify-center">
                <HelpCircle size={20} color="#f5e642" />
              </View>
              <View>
                <Typography variant="label-sm" className="text-text-secondary">
                  Need Help?
                </Typography>
                <Typography variant="caption" className="opacity-60">
                  Contact Lemon Support
                </Typography>
              </View>
            </Card>
          </View>
        </View>
      </ScrollView>

      {/* Decorative Background */}
      <View className="absolute inset-0 -z-10" pointerEvents="none">
        <View
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-fixed/5"
          style={{ filter: "blur(120px)" }}
        />
        <View
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/5"
          style={{ filter: "blur(120px)" }}
        />
      </View>
    </Screen>
  );
}
