import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Screen } from "@/components/ui/Screen";
import { Typography } from "@/components/ui/Typography";
import { StepProgressBar } from "@/components/ui/StepProgressBar";
import { OtpInput } from "@/components/ui/OtpInput";
import { useRegistrationStore } from "@/store/registrationStore";
import { useAuth } from "@/context/AuthContext";
import {
  useLoginOtp,
  useVerifyOtp,
  useRequestOtp,
  useRegister,
  extractMessage,
} from "@/lib/hooks/useAuthMutations";
import { RegisterResponse } from "@/types/api";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Toast } from "@/components/ui/Toast";

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { mode, email: emailParam } = useLocalSearchParams<{
    mode: "login" | "register";
    email: string;
  }>();

  const store = useRegistrationStore();
  const { login } = useAuth();

  const email =
    mode === "register" ? store.email : decodeURIComponent(emailParam || "");

  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(60);

  const { mutate: loginOtp, isPending: isLoginPending } = useLoginOtp();
  const { mutate: verifyOtp, isPending: isVerifyPending } = useVerifyOtp();
  const { mutate: requestOtp } = useRequestOtp();
  const { mutate: register, isPending: isRegisterPending } = useRegister();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = () => {
    if (otp.length !== 4) return;

    if (mode === "register") {
      // Call register directly as it handles OTP verification internally.
      // Calling verifyOtp first might 'consume' the OTP, causing register to fail.
      register(
        {
          email: store.email,
          first_name: store.firstName,
          last_name: store.lastName,
          account_type: store.accountType || "buyer",
          phone_no: store.phone,
          dob: store.dob,
          otp,
        },
        {
          onSuccess: (data: any) => {
            Toast.show({
              message: "Registration successful!",
              type: "success",
            });
            // Use the token and user payload from the registration response
            // to log the user in immediately. Set needsPin=true to trigger PIN setup.
            login(data.token, data.user, true);

            // Success! AuthContext will now route the user to /pin-setup
            store.reset();
          },
          onError: (err: any) => {
            Toast.show({
              message: extractMessage(err),
              type: "error",
            });
          },
        },
      );
    } else {
      loginOtp(
        { email, otp },
        {
          onSuccess: (data) => {
            login(data.token, data.user, false);
            router.replace("/(tabs)");
          },
          onError: (err: any) => {
            Toast.show({
              message: err.response?.data?.message || "Login failed",
              type: "error",
            });
          },
        },
      );
    }
  };

  const handleResend = () => {
    if (countdown === 0) {
      requestOtp(email);
      setCountdown(60);
    }
  };

  const isLoading = isLoginPending || isVerifyPending || isRegisterPending;

  return (
    <Screen withPadding={false}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 20,
            paddingTop: 40,
          }}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        >
          {/* Header */}
          {mode === "register" ? (
            <StepProgressBar
              currentStep={3}
              totalSteps={3}
              label="VERIFY EMAIL"
            />
          ) : (
            <View className="flex-row justify-between items-center mb-12">
              <Typography style={styles.accessText}>SECURITY ACCESS</Typography>
              <Typography style={styles.verifyYellow}>VERIFY EMAIL</Typography>
            </View>
          )}

          {/* Heading */}
          <View className="items-center mb-12">
            <Typography style={styles.heading}>Security Check.</Typography>
            <Typography style={styles.subtext}>
              We sent a code to your email.
            </Typography>
            <Typography style={styles.emailText}>{email}</Typography>
          </View>

          {/* Boxes Row + Keypad (Internal to OtpInput) */}
          <OtpInput
            length={4}
            value={otp}
            onChange={setOtp}
            showCustomKeypad={false}
          />

          {/* Verify Button & Resend (Fixed above keypad) */}
          <View style={{ marginTop: 10 }}>
            <TouchableOpacity
              onPress={handleVerify}
              disabled={otp.length !== 4 || isLoading}
              activeOpacity={0.8}
              style={{ marginBottom: 24 }}
            >
              <LinearGradient
                colors={["#F5E642", "#D4C200"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.button,
                  (otp.length !== 4 || isLoading) && { opacity: 0.6 },
                ]}
              >
                <Typography style={styles.buttonText}>
                  {isLoading ? "VERIFYING..." : "Verify OTP"}
                </Typography>
              </LinearGradient>
            </TouchableOpacity>

            <View className="flex-row justify-center items-center mb-12">
              <Typography style={{ color: "#8B949E", fontSize: 14 }}>
                Didn't receive the code?{" "}
              </Typography>
              <TouchableOpacity onPress={handleResend} disabled={countdown > 0}>
                <Typography
                  style={{
                    color: countdown > 0 ? "#484F58" : "#00C896",
                    fontSize: 14,
                    fontWeight: "800",
                  }}
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
                </Typography>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  accessText: {
    color: "#484F58",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  verifyYellow: {
    color: "#F5E642",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  heading: {
    color: "#FFFFFF",
    fontSize: 40,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
  },
  subtext: { color: "#8B949E", fontSize: 16, textAlign: "center" },
  emailText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 4,
  },
  button: {
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#0D1117", fontSize: 16, fontWeight: "800" },
});
