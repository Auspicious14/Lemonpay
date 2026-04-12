import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Screen } from "@/components/ui/Screen";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function RoleSelectionScreen() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<"buyer" | "seller">("buyer");

  const handleProceed = () => {
    router.push("/(auth)/register");
  };

  return (
    <Screen withPadding={false} className="bg-[#090B0D]">
      <StatusBar barStyle="light-content" />

      <ScrollView
        className="flex-1 px-6 pt-12"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-12">
          <View className="flex-row items-center space-x-2">
            <View className="w-8 h-8 bg-[#F5E642] rounded-lg items-center justify-center">
              <Ionicons name="shield-checkmark" size={18} color="#0D1117" />
            </View>
            <Typography
              variant="heading"
              className="text-[#F5E642] font-inter-extrabold text-sm tracking-widest uppercase"
            >
              SENTINEL
            </Typography>
          </View>
          <Typography
            variant="label-sm"
            className="text-[#8B949E] tracking-widest"
          >
            STEP 03 / 04
          </Typography>
        </View>

        <Typography
          variant="display-lg"
          className="text-white text-[48px] leading-[54px] mb-6"
        >
          Define Your{"\n"}
          <Typography variant="display-lg" className="text-[#F5E642]">
            Role
          </Typography>
        </Typography>

        <Typography
          variant="body"
          className="text-[#8B949E] text-[15px] leading-[24px] mb-10"
        >
          Whether you're securing a purchase or protecting your trade, choose
          your path to initiate the Sentinel protocol.
        </Typography>

        {/* Buyer Card */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setSelectedRole("buyer")}
          className="mb-6"
        >
          <Card
            variant={selectedRole === "buyer" ? "high" : "low"}
            className={`bg-[#161B22] border-2 ${selectedRole === "buyer" ? "border-[#43E5B1]" : "border-[#30363D]"} p-6`}
            radius="xl"
          >
            <View className="flex-row justify-between items-start mb-6">
              <View className="w-14 h-14 bg-[#30363D] rounded-2xl items-center justify-center">
                <Ionicons name="bag-handle" size={28} color="#43E5B1" />
              </View>
              {selectedRole === "buyer" && (
                <View className="w-8 h-8 bg-[#43E5B1] rounded-full items-center justify-center shadow-lg shadow-[#43E5B1]/40">
                  <Ionicons name="checkmark-circle" size={24} color="#0D1117" />
                </View>
              )}
            </View>

            <Typography variant="heading" className="text-white mb-4">
              I am a Buyer
            </Typography>
            <Typography variant="body" className="text-[#8B949E] mb-6">
              Secure your funds in escrow until delivery is verified. Experience
              worry-free transactions with global sellers and service providers.
            </Typography>

            <View className="space-y-3">
              <View className="flex-row items-center space-x-3">
                <Ionicons name="checkmark-circle" size={18} color="#43E5B1" />
                <Typography variant="caption" className="text-white">
                  Funds protected by smart-contracts
                </Typography>
              </View>
              <View className="flex-row items-center space-x-3">
                <Ionicons name="checkmark-circle" size={18} color="#43E5B1" />
                <Typography variant="caption" className="text-white">
                  Release funds only when satisfied
                </Typography>
              </View>
            </View>

            {selectedRole === "buyer" && (
              <View className="mt-6 h-1 w-full bg-[#43E5B1] rounded-full" />
            )}
          </Card>
        </TouchableOpacity>

        {/* Seller Card */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setSelectedRole("seller")}
          className="mb-10"
        >
          <Card
            variant={selectedRole === "seller" ? "high" : "low"}
            className={`bg-[#161B22] border-2 ${selectedRole === "seller" ? "border-[#F5E642]" : "border-[#30363D]"} p-6`}
            radius="xl"
          >
            <View className="flex-row justify-between items-start mb-6">
              <View className="w-14 h-14 bg-[#30363D] rounded-2xl items-center justify-center">
                <Ionicons name="storefront" size={28} color="#F5E642" />
              </View>
              {selectedRole === "seller" && (
                <View className="w-8 h-8 bg-[#F5E642] rounded-full items-center justify-center shadow-lg shadow-[#F5E642]/40">
                  <Ionicons name="checkmark-circle" size={24} color="#0D1117" />
                </View>
              )}
            </View>

            <Typography variant="heading" className="text-white mb-4">
              I am a Seller
            </Typography>
            <Typography variant="body" className="text-[#8B949E] mb-6">
              Ensure payment is secured before you start work or ship goods.
              Build trust with high-value clients through verifiable proof of
              funds.
            </Typography>

            <View className="space-y-3">
              <View className="flex-row items-center space-x-3">
                <Ionicons name="lock-closed" size={18} color="#F5E642" />
                <Typography variant="caption" className="text-white">
                  Guaranteed payment upon delivery
                </Typography>
              </View>
              <View className="flex-row items-center space-x-3">
                <MaterialCommunityIcons
                  name="finance"
                  size={18}
                  color="#F5E642"
                />
                <Typography variant="caption" className="text-white">
                  Verified professional reputation
                </Typography>
              </View>
            </View>

            {selectedRole === "seller" && (
              <View className="mt-6 h-1 w-full bg-[#F5E642] rounded-full" />
            )}
          </Card>
        </TouchableOpacity>

        <Button
          label="PROCEED TO ONBOARDING"
          onPress={handleProceed}
          rightIcon={
            <Ionicons name="arrow-forward" size={20} color="#1f1c00" />
          }
          className="mb-6 shadow-2xl shadow-[#F5E642]/20"
        />

        <Typography
          variant="label-sm"
          className="text-[#575B5F] text-center mb-12 tracking-widest leading-relaxed"
        >
          YOU CAN ADD ADDITIONAL ROLES TO YOUR PROFILE{"\n"}LATER.
        </Typography>

        {/* Footer */}
        <View className="items-center justify-center pb-20">
          <View className="flex-row items-center space-x-2 mb-6">
            <View className="w-4 h-4 bg-[#8B949E]/30 rounded-full items-center justify-center">
              <Ionicons name="shield-checkmark" size={10} color="#8B949E" />
            </View>
            <Typography
              variant="label-sm"
              className="text-[#8B949E] opacity-60"
            >
              SENTINEL
            </Typography>
          </View>

          <View className="flex-row items-center space-x-6 mb-10">
            <Typography
              variant="label-sm"
              className="text-[#8B949E] opacity-60"
            >
              PRIVACY
            </Typography>
            <Typography
              variant="label-sm"
              className="text-[#8B949E] opacity-60"
            >
              TERMS
            </Typography>
            <Typography
              variant="label-sm"
              className="text-[#8B949E] opacity-60"
            >
              SECURITY
            </Typography>
            <Typography
              variant="label-sm"
              className="text-[#8B949E] opacity-60"
            >
              HELP
            </Typography>
          </View>

          <Typography variant="label-sm" className="text-[#8B949E] opacity-40">
            © 2024 SENTINEL ESCROW. SECURED BY BLOCKCHAIN.
          </Typography>
        </View>
      </ScrollView>

      {/* Fixed Navigation Icons */}
      <View className="absolute bottom-10 left-0 right-0 px-10 flex-row justify-between">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#575B5F" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="help-circle-outline" size={26} color="#575B5F" />
        </TouchableOpacity>
      </View>
    </Screen>
  );
}
