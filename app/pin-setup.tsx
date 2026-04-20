import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/ui/Screen";
import { Typography } from "@/components/ui/Typography";
import { useSetPin } from "@/lib/hooks/useAuthMutations";
import { useAuth } from "@/context/AuthContext";
import { StatusBar } from "expo-status-bar";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function PinSetupScreen() {
  const router = useRouter();
  const { markPinSetup, logout } = useAuth();

  // States
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { mutate: setPinMutation, isPending } = useSetPin();

  const handleSetPin = () => {
    if (pin.length !== 4) {
      setError("Please enter a 4-digit Transaction PIN.");
      return;
    }

    setPinMutation(pin, {
      onSuccess: () => {
        // Log out safely and redirect to login to verify the new PIN
        logout();
      },
      onError: (err: any) => {
        setError(err.message || "Failed to set PIN. Please try again.");
      },
    });
  };

  const handleSkip = async () => {
    await markPinSetup();
    router.replace("/home");
  };

  const isPinValid = pin.length === 4;

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
            paddingTop: 40,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Row: STEP & 100% */}
          <View className="flex-row justify-between items-center mb-4">
            <Typography
              variant="label-sm"
              className="!text-[#00C896] !font-inter-bold !tracking-wide"
            >
              STEP 3 OF 3
            </Typography>
            <Typography
              variant="label-sm"
              className="!text-[#00C896] !font-inter-bold !tracking-wide"
            >
              100%
            </Typography>
          </View>

          {/* Progress Bar */}
          <View
            style={{
              height: 4,
              width: "100%",
              backgroundColor: "#00C896",
              borderRadius: 2,
              marginBottom: 40,
            }}
          />

          {/* Large Shield Hero */}
          <View className="items-center mb-8">
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "rgba(102, 117, 44, 0.2)",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "rgba(102, 117, 44, 0.3)",
              }}
            >
              <Ionicons name="shield-checkmark" size={40} color="#00C896" />
            </View>
            <Typography variant="display">Ironclad Guard</Typography>
            <Typography
              variant="body"
              className="!text-[#8B949E] !text-center "
            >
              Your wealth is protected by multi-layered biometric protocols and
              secure enclave technology.
            </Typography>
          </View>

          {/* Security Feature Row */}
          <View
            style={{
              backgroundColor: "#161B22",
              padding: 16,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "#30363D",
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 32,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: "rgba(0, 200, 150, 0.1)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="lock-closed" size={20} color="#00C896" />
            </View>
            <View style={{ marginLeft: 16, flex: 1 }}>
              <Typography variant="label-sm" className="!text-[#00C896]">
                ENCRYPTED VAULT
              </Typography>
              <Typography variant="caption" className="!text-[#8B949E]">
                Sensitive data is hashed and stored in isolated hardware layers.
              </Typography>
            </View>
          </View>

          <View style={{ marginBottom: 32 }}>
            <View className="flex-row items-center mb-2">
              <MaterialCommunityIcons
                name="keyboard-outline"
                size={18}
                color="#FFFFFF"
                style={{ marginRight: 8 }}
              />
              <Typography
                variant="body"
                className="!text-[#FFFFFF] !font-inter-bold"
              >
                Transaction PIN
              </Typography>
            </View>
            <Typography variant="caption" className="!text-[#8B949E] !mb-4">
              Set your 4-digit code for fund releases.
            </Typography>

            <View className="flex-row justify-between" style={{ gap: 12 }}>
              {[0, 1, 2, 3].map((idx) => (
                <View
                  key={idx}
                  style={{
                    flex: 1,
                    height: 60,
                    backgroundColor: "#21262D",
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: pin.length > idx ? "#00C896" : "#30363D",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    variant="body"
                    className="!text-[#FFFFFF] !font-inter-bold"
                  >
                    {pin.length > idx ? "•" : ""}
                  </Typography>
                </View>
              ))}
              <TextInput
                value={pin}
                onChangeText={(val) =>
                  setPin(val.replace(/[^0-9]/g, "").slice(0, 4))
                }
                keyboardType="number-pad"
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  opacity: 0,
                }}
                autoFocus={true}
              />
            </View>
          </View>

          {error && (
            <Typography
              style={{
                color: "#F85149",
                fontSize: 12,
                textAlign: "center",
                marginBottom: 16,
              }}
            >
              {error}
            </Typography>
          )}

          {/* CTA Button */}
          <TouchableOpacity
            onPress={handleSetPin}
            disabled={!isPinValid || isPending}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#F5E642", "#A2D400"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                height: 56,
                borderRadius: 28,
                alignItems: "center",
                justifyContent: "center",
                opacity: !isPinValid || isPending ? 0.6 : 1,
              }}
            >
              <Typography
                variant="body"
                className="!text-[#0D1117] !font-inter-bold"
              >
                {isPending ? "SECURING..." : "FINISH SETUP ✓"}
              </Typography>
            </LinearGradient>
          </TouchableOpacity>

          <Typography
            style={{
              color: "#484F58",
              fontSize: 9,
              textAlign: "center",
              marginTop: 16,
              letterSpacing: 0.5,
            }}
          >
            AUTHORIZED BY LYMEPAY SECURITY PROTOCOL V4.2
          </Typography>
        </ScrollView>

        {/* Bottom Bar */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 24,
            paddingVertical: 16,
            borderTopWidth: 1,
            borderTopColor: "#30363D",
            backgroundColor: "#0D1117",
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#8B949E" />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: "#F5E642",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              style={{ color: "#0D1117", fontSize: 14, fontWeight: "800" }}
            >
              ?
            </Typography>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  inputLabel: {
    fontSize: 10,
    letterSpacing: 1.2,
    color: "#8B949E",
    fontWeight: "700",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#21262D",
    borderRadius: 12,
    height: 52,
    borderWidth: 1,
    borderColor: "#30363D",
    overflow: "hidden",
  },
  textInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    paddingHorizontal: 16,
    height: "100%",
  },
});
