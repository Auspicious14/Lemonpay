import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { Screen } from "../../components/ui/Screen";
import { Typography } from "../../components/ui/Typography";
import { Button } from "../../components/ui/Button";
import { apiClient } from "../../lib/api/client";
import { Toast } from "../../components/ui/Toast";

export default function VerifyPhoneScreen() {
  const router = useRouter();
  const { user, updateUser, checkSession } = useAuth();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputs = useRef<TextInput[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      Toast.show({ message: "Please enter the 6-digit code", type: "error" });
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post("/auth/verify-phone", { code });

      updateUser({ email_verified_at: new Date().toISOString() });
      Toast.show({ message: "Phone verified successfully!", type: "success" });

      // Auth guard handles redirect based on user.needsPin
      router.replace("/(tabs)");
    } catch (error: any) {
      Toast.show({
        message: error.response?.data?.message || "Verification failed",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    try {
      await apiClient.post("/auth/resend-otp");
      setTimer(60);
      Toast.show({ message: "New code sent!", type: "success" });
    } catch (error: any) {
      Toast.show({ message: "Failed to resend code", type: "error" });
    }
  };

  return (
    <Screen className="bg-[#0D1117] px-6">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center"
      >
        <View className="mb-12">
          <Typography variant="display" className="text-white text-3xl mb-2">
            Verify Phone
          </Typography>
          <Typography className="text-gray-400 text-lg">
            We sent a 6-digit code to {user?.phone_no || "your phone number"}.
          </Typography>
        </View>

        <View className="flex-row justify-between mb-8">
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={(ref) => {
                inputs.current[i] = ref as TextInput;
              }}
              className="w-12 h-16 bg-[#161B22] text-[#F5E642] text-2xl font-bold text-center rounded-xl border border-gray-800"
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(val) => handleOtpChange(val, i)}
              onKeyPress={(e) => handleKeyPress(e, i)}
              autoFocus={i === 0}
            />
          ))}
        </View>

        <Button
          label="Verify Code"
          onPress={handleVerify}
          loading={isLoading}
        />

        <View className="flex-row justify-center mt-8">
          <Typography className="text-gray-400">
            Didn't receive code?{" "}
          </Typography>
          <TouchableOpacity onPress={handleResend} disabled={timer > 0}>
            <Typography
              className={`${timer > 0 ? "text-gray-600" : "text-[#F5E642]"} font-bold`}
            >
              {timer > 0 ? `Resend in ${timer}s` : "Resend Code"}
            </Typography>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
