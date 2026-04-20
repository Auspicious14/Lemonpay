import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  StyleSheet,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Screen } from "@/components/ui/Screen";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import {
  useLoginOtp,
  usePinLogin,
  useRequestOtp,
  extractMessage,
} from "@/lib/hooks/useAuthMutations";
import { useAuth } from "@/context/AuthContext";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Toast } from "@/components/ui/Toast";
import Animated, { Layout, FadeIn, FadeOut } from "react-native-reanimated";
import { TokenStorage } from "@/lib/storage";

export default function LoginScreen() {
  const router = useRouter();
  const searchParams = useLocalSearchParams<{ email?: string }>();
  const { login } = useAuth();
  const [loginMode, setLoginMode] = useState<"otp" | "pin">("otp");

  // Form State
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);

  const { mutate: requestOtp, isPending: isOtpRequestPending } =
    useRequestOtp();
  const { mutate: pinLogin, isPending: isPinLoginPending } = usePinLogin();

  useEffect(() => {
    const loadEmail = async () => {
      // Prioritize email from search params (e.g. after registration)
      if (searchParams.email) {
        setEmail(searchParams.email);
        return;
      }

      const savedEmail = await TokenStorage.getSavedEmail();
      if (savedEmail) setEmail(savedEmail);
    };
    loadEmail();
  }, [searchParams.email]);

  const handleLogin = () => {
    if (!email) {
      Toast.show({ message: "Please enter your email", type: "error" });
      return;
    }

    if (loginMode === "otp") {
      requestOtp(email, {
        onSuccess: () => {
          router.push({
            pathname: "/(auth)/verify-otp",
            params: { mode: "login", email },
          });
        },
        onError: (err: any) => {
          Toast.show({
            message: extractMessage(err),
            type: "error",
          });
        },
      });
    } else {
      if (pin.length !== 4) {
        Toast.show({ message: "PIN must be 4 digits", type: "error" });
        return;
      }
      pinLogin(
        { email, pin },
        {
          onSuccess: (data: any) => {
            login(data.token, data.user, false);
            router.replace("/home");
          },
          onError: (err: any) => {
            Toast.show({
              message: extractMessage(err),
              type: "error",
            });
          },
        },
      );
    }
  };

  return (
    <Screen withPadding={false}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingTop: 60,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Back Icon if applicable */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Header Section */}
          <View style={{ marginBottom: 40 }}>
            <Typography
              variant="body"
              style={{ color: "#FFFFFF", marginBottom: 8 }}
            >
              Welcome{" "}
              <Typography style={{ color: "#F5E642" }}>Back.</Typography>
            </Typography>
            <Typography style={{ color: "#8B949E", fontSize: 16 }}>
              {loginMode === "otp"
                ? "Login securely with a one-time passcode."
                : "Enter your secure PIN to access your vault."}
            </Typography>
          </View>

          {/* Mode Switcher */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              onPress={() => setLoginMode("otp")}
              style={[styles.tab, loginMode === "otp" && styles.activeTab]}
            >
              <Ionicons
                name="mail-outline"
                size={18}
                color={loginMode === "otp" ? "#0D1117" : "#8B949E"}
              />
              <Typography
                variant="body"
                className={
                  loginMode === "otp" ? "!text-[#0D1117]" : "!text-[#8B949E]"
                }
              >
                OTP Login
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setLoginMode("pin")}
              style={[styles.tab, loginMode === "pin" && styles.activeTab]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={loginMode === "pin" ? "#0D1117" : "#8B949E"}
              />
              <Typography
                variant="body"
                className={
                  loginMode === "pin" ? "!text-[#0D1117]" : "!text-[#8B949E]"
                }
              >
                PIN Access
              </Typography>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <Animated.View layout={Layout.springify()} style={styles.formCard}>
            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <Typography variant="label" className="!text-primary-fixed mb-2">
                EMAIL ADDRESS
              </Typography>
              <View style={styles.inputContainer}>
                <Ionicons name="at-outline" size={20} color="#484F58" />
                <TextInput
                  placeholder="name@email.com"
                  placeholderTextColor="#484F58"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.textInput}
                />
              </View>
            </View>

            {/* PIN Input (Conditional) */}
            {loginMode === "pin" && (
              <Animated.View
                entering={FadeIn.duration(300)}
                exiting={FadeOut.duration(200)}
                style={styles.inputWrapper}
              >
                <Typography
                  variant="label"
                  className="!text-primary-fixed mb-2"
                >
                  SECURE PIN
                </Typography>
                <View style={styles.inputContainer}>
                  <Ionicons name="key-outline" size={20} color="#484F58" />
                  <TextInput
                    placeholder="****"
                    placeholderTextColor="#484F58"
                    value={pin}
                    onChangeText={setPin}
                    keyboardType="number-pad"
                    secureTextEntry={!showPin}
                    maxLength={4}
                    style={styles.textInput}
                  />
                  <TouchableOpacity onPress={() => setShowPin(!showPin)}>
                    <Ionicons
                      name={showPin ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#8B949E"
                    />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}

            {/* CTA Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isOtpRequestPending || isPinLoginPending}
              activeOpacity={0.8}
              style={{ marginTop: 8 }}
            >
              <LinearGradient
                colors={["#F5E642", "#D4C200"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.button,
                  (isOtpRequestPending || isPinLoginPending) && {
                    opacity: 0.6,
                  },
                ]}
              >
                <Typography variant="body" className="!text-black">
                  {loginMode === "otp"
                    ? isOtpRequestPending
                      ? "Sending Code..."
                      : "Send Secure Code"
                    : isPinLoginPending
                      ? "Verifying..."
                      : "Access Vault"}
                </Typography>
                <Ionicons name="chevron-forward" size={18} color="#0D1117" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Forgot PIN / Support */}
            <TouchableOpacity style={{ marginTop: 24, alignItems: "center" }}>
              <Typography variant="caption" className="!text-[#8B949E]">
                Having trouble?{" "}
                <Typography variant="caption" className="!text-primary-fixed">
                  Contact Support
                </Typography>
              </Typography>
            </TouchableOpacity>
          </Animated.View>

          {/* New account shortcut */}
          <TouchableOpacity
            onPress={() => router.push("/(auth)/register")}
            style={styles.registerLink}
          >
            <Typography variant="caption" className="!text-[#8B949E]">
              Don't have an account?{" "}
              <Typography variant="caption" className="!text-primary-fixed">
                Join LymePay
              </Typography>
            </Typography>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#161B22",
    borderWidth: 1,
    borderColor: "#30363D",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#161B22",
    padding: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#30363D",
    marginBottom: 32,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  activeTab: {
    backgroundColor: "#F5E642",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8B949E",
  },
  activeTabText: {
    color: "#0D1117",
  },
  formCard: {
    backgroundColor: "#161B22",
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#30363D",
  },
  inputWrapper: {
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: "800",
    color: "#484F58",
    marginBottom: 8,
    letterSpacing: 1.5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0D1117",
    height: 56,
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#30363D",
  },
  textInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    paddingHorizontal: 12,
    height: "100%",
  },
  button: {
    flexDirection: "row",
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: {
    color: "#0D1117",
    fontSize: 16,
    fontWeight: "800",
  },
  registerLink: {
    marginTop: 40,
    marginBottom: 40,
    alignItems: "center",
  },
});
