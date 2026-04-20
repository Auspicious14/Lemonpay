import React, { useState } from "react";
import { View, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/ui/Screen";
import { Typography } from "@/components/ui/Typography";
import { StepProgressBar } from "@/components/ui/StepProgressBar";
import { useRegistrationStore } from "@/store/registrationStore";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useRequestOtp, extractMessage } from "@/lib/hooks/useAuthMutations";
import { Toast } from "@/components/ui/Toast";

export default function AccountTypeScreen() {
  const router = useRouter();
  const { email, setAccountType } = useRegistrationStore();
  const [selectedType, setSelectedType] = useState<"buyer" | "seller">("buyer");

  const { mutate: requestOtp, isPending } = useRequestOtp();

  const handleProceed = () => {
    setAccountType(selectedType);
    requestOtp(email, {
      onSuccess: () => {
        router.push("/(auth)/verify-otp?mode=register");
      },
      onError: (err: any) => {
        Toast.show({
          message: extractMessage(err),
          type: "error",
        });
      },
    });
  };

  return (
    <Screen withPadding={false}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 20,
          paddingTop: 40,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Wordmark */}
        <View className="flex-row items-center mb-6">
          <Ionicons name="shield-checkmark" size={20} color="#F5E642" />
          <Typography variant="subheading" className="!text-primary-fixed">
            LYMEPAY
          </Typography>
        </View>

        {/* Progress */}
        <StepProgressBar currentStep={2} totalSteps={3} label="VERIFY EMAIL" />

        {/* Heading */}
        <View className="flex-row items-center mb-2">
          <Typography variant="heading">Define Your </Typography>
          <Typography variant="heading" className="!text-primary-fixed">
            Role
          </Typography>
        </View>
        <Typography variant="body" className="mb-4">
          Whether you're securing a purchase or protecting your trade, choose
          the path that fits you.
        </Typography>

        {/* Buyer Card */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setSelectedType("buyer")}
          style={[
            styles.roleCard,
            selectedType === "buyer" && styles.selectedBuyerCard,
          ]}
        >
          {selectedType === "buyer" && (
            <View style={styles.checkBadgeBuyer}>
              <Ionicons name="checkmark" size={12} color="white" />
            </View>
          )}

          <View style={styles.roleHeader}>
            <View
              style={[
                styles.iconBox,
                selectedType === "buyer" && styles.iconBoxSelectedBuyer,
              ]}
            >
              <MaterialCommunityIcons
                name="shopping-outline"
                size={24}
                color={selectedType === "buyer" ? "#00C896" : "#484F58"}
              />
            </View>
            <View style={{ marginLeft: 16 }}>
              <Typography variant="body" className="!text-primary-fixed mb-2">
                I am a Buyer
              </Typography>
              <Typography variant="caption">
                I want to purchase goods securely.
              </Typography>
            </View>
          </View>

          <View style={styles.featureList}>
            <View className="flex-row items-center mb-2">
              <Ionicons name="shield-checkmark" size={14} color="#00C896" />
              <Typography style={styles.featureText}>
                Funds protected by smart-contracts
              </Typography>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={14} color="#00C896" />
              <Typography style={styles.featureText}>
                Release funds only when satisfied
              </Typography>
            </View>
          </View>

          {selectedType === "buyer" && (
            <LinearGradient
              colors={["rgba(0, 200, 150, 0.5)", "transparent"]}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 1 }}
              style={styles.bottomAccent}
            />
          )}
        </TouchableOpacity>

        {/* Seller Card */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setSelectedType("seller")}
          style={[
            styles.roleCard,
            { marginTop: 16 },
            selectedType === "seller" && styles.selectedSellerCard,
          ]}
        >
          {selectedType === "seller" && (
            <View style={styles.checkBadgeSeller}>
              <Ionicons name="checkmark" size={12} color="black" />
            </View>
          )}

          <View style={styles.roleHeader}>
            <View
              style={[
                styles.iconBox,
                selectedType === "seller" && styles.iconBoxSelectedSeller,
              ]}
            >
              <MaterialCommunityIcons
                name="storefront-outline"
                size={24}
                color={selectedType === "seller" ? "#F5E642" : "#484F58"}
              />
            </View>
            <View style={{ marginLeft: 16 }}>
              <Typography variant="body" className="!text-primary-fixed mb-2">
                I am a Seller
              </Typography>
              <Typography variant="caption">
                I want to sell my products with trust.
              </Typography>
            </View>
          </View>

          <View style={styles.featureList}>
            <View className="flex-row items-center mb-2">
              <Ionicons
                name="lock-closed"
                size={14}
                color={selectedType === "seller" ? "#F5E642" : "#484F58"}
              />
              <Typography style={styles.featureText}>
                Guaranteed payment upon delivery
              </Typography>
            </View>
            <View className="flex-row items-center">
              <Ionicons
                name="trending-up"
                size={14}
                color={selectedType === "seller" ? "#F5E642" : "#484F58"}
              />
              <Typography style={styles.featureText}>
                Build reputable trade history
              </Typography>
            </View>
          </View>

          {selectedType === "seller" && (
            <LinearGradient
              colors={["rgba(245, 230, 66, 0.5)", "transparent"]}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 1 }}
              style={styles.bottomAccent}
            />
          )}
        </TouchableOpacity>

        {/* Button */}
        <TouchableOpacity
          onPress={handleProceed}
          disabled={isPending}
          activeOpacity={0.8}
          style={{ marginTop: 32 }}
        >
          <LinearGradient
            colors={["#F5E642", "#D4C200"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.button, isPending && { opacity: 0.6 }]}
          >
            <View className="flex-row gap-2 items-center">
              <Typography variant="body" className="!text-black">
                {isPending ? "REQUESTING OTP..." : "PROCEED TO ONBOARDING"}
              </Typography>
              <Ionicons name="arrow-forward" size={18} color="#0D1117" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <Typography style={styles.footerDisclaimer}>
          YOU CAN ADD ADDITIONAL ROLES TO YOUR PROFILE LATER.
        </Typography>

        {/* Footer */}
        <View style={styles.footerLinks}>
          <Ionicons
            name="shield-checkmark"
            size={24}
            color="#8B949E"
            style={{ marginBottom: 16 }}
          />
          <View className="flex-row items-center" style={{ gap: 12 }}>
            {["PRIVACY", "TERMS", "SECURITY", "HELP"].map((link, idx) => (
              <View
                key={link}
                className="flex-row items-center"
                style={{ gap: 12 }}
              >
                <Typography style={styles.footerLinkText}>{link}</Typography>
                {idx < 3 && <View style={styles.dot} />}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center"
        >
          <Typography variant="caption" className="!text-sm">
            ← BACK
          </Typography>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center">
          <Typography variant="caption" className="!text-sm">
            ? HELP
          </Typography>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brandText: {
    color: "#F5E642",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
    marginLeft: 6,
    textTransform: "uppercase",
  },
  headingWhite: { color: "#FFFFFF", fontSize: 32, fontWeight: "800" },
  headingYellow: { color: "#F5E642", fontSize: 32, fontWeight: "800" },
  subtext: { color: "#8B949E", fontSize: 14, marginBottom: 32, lineHeight: 20 },
  roleCard: {
    backgroundColor: "#161B22",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: "#30363D",
    position: "relative",
    overflow: "hidden",
  },
  selectedBuyerCard: { borderColor: "#00C896", borderWidth: 1.5 },
  selectedSellerCard: { borderColor: "#F5E642", borderWidth: 1.5 },
  checkBadgeBuyer: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#00C896",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  checkBadgeSeller: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#F5E642",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  roleHeader: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#21262D",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBoxSelectedBuyer: { backgroundColor: "#00C89615" },
  iconBoxSelectedSeller: { backgroundColor: "#F5E64215" },
  roleTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },
  roleSub: { color: "#8B949E", fontSize: 13, marginTop: 2 },
  featureList: { paddingTop: 16, borderTopWidth: 1, borderTopColor: "#30363D" },
  featureText: { color: "#8B949E", fontSize: 13, marginLeft: 10 },
  bottomAccent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  button: {
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  footerDisclaimer: {
    color: "#484F58",
    fontSize: 10,
    textAlign: "center",
    marginTop: 16,
    letterSpacing: 1,
  },
  footerLinks: {
    borderTopWidth: 1,
    borderTopColor: "#30363D",
    alignItems: "center",
    marginTop: 32,
    paddingTop: 32,
  },
  footerLinkText: {
    color: "#484F58",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1,
  },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: "#30363D" },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#30363D",
    backgroundColor: "#0D1117",
  },
  bottomLinkText: {
    color: "#8B949E",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
});
