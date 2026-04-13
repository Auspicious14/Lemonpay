import React, { useEffect, useRef, useMemo } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  MaterialCommunityIcons,
  MaterialIcons,
  Feather,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Clipboard from "expo-clipboard";
import { Screen } from "@/components/ui/Screen";
import { Typography } from "@/components/ui/Typography";
import { useAuth } from "@/context/AuthContext";
import { useToastStore } from "@/store/useToastStore";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Button } from "@/components/ui/Button";

const { width } = Dimensions.get("window");

export default function BankTransferScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { amount, reference } = useLocalSearchParams();
  const { show: showToast } = useToastStore();

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["35%"], []);

  // Animation for green pulse
  const pulseAnim = useRef(new Animated.Value(0.5)).current;
  // Animation for shimmer
  const shimmerAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: width,
        duration: 2000,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const handleCopy = async (value: string, label: string) => {
    await Clipboard.setStringAsync(value);
    showToast(`${label} copied!`, "success");
  };

  const handleConfirmed = () => {
    bottomSheetRef.current?.expand();
  };

  const NigeriaAmount = parseFloat((amount as string) || "0").toLocaleString(
    "en-NG",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  );

  return (
    <Screen withPadding={false}>
      <View className="flex-row items-center justify-between px-6 py-4 bg-[#0D1117]">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#F5E642" />
        </TouchableOpacity>
        <Typography variant="heading" className="text-[#F5E642]" weight="700">
          Fund Wallet
        </Typography>
        <Typography
          variant="body"
          className="text-white font-bold"
          weight="800"
        >
          LEMONPAY
        </Typography>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 150 }}
      >
        <View className="mt-6">
          <Typography className="text-white text-[36px] font-bold mb-4">
            Bank Transfer
          </Typography>
          <Typography className="text-[#8B949E] text-base leading-[22px] mb-8">
            Transfer the exact amount to the account below. Your wallet will be
            credited instantly.
          </Typography>

          {/* TRANSFER AMOUNT CARD */}
          <View className="bg-[#1C2128] rounded-[24px] p-6 items-center justify-center mb-6">
            <Typography className="text-[#F5E642] text-[10px] font-bold tracking-[2px] uppercase mb-2">
              TRANSFER AMOUNT
            </Typography>
            <Typography className="text-white text-5xl font-bold">
              ₦{NigeriaAmount}
            </Typography>
          </View>

          {/* BANK DETAILS CARD */}
          <View className="bg-[#161B22] rounded-[24px] border border-[#30363D] overflow-hidden">
            {/* ROW 1 - BANK NAME */}
            <View className="flex-row items-center justify-between p-5">
              <View>
                <Typography className="text-[#8B949E] text-[10px] font-bold uppercase mb-1">
                  BANK NAME
                </Typography>
                <Typography className="text-white font-bold text-lg">
                  Wema Bank (LemonPay)
                </Typography>
              </View>
              <TouchableOpacity
                onPress={() => handleCopy("Wema Bank (LemonPay)", "Bank Name")}
                className="w-10 h-10 bg-[#21262D] rounded-xl items-center justify-center"
              >
                <Feather name="copy" size={18} color="#F5E642" />
              </TouchableOpacity>
            </View>
            <View className="h-[1px] bg-[#30363D] mx-5" />

            {/* ROW 2 - ACCOUNT NUMBER */}
            <View className="flex-row items-center justify-between p-5">
              <View>
                <Typography className="text-[#8B949E] text-[10px] font-bold uppercase mb-1">
                  ACCOUNT NUMBER
                </Typography>
                <Typography
                  className="text-white font-bold text-2xl"
                  style={{
                    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
                  }}
                >
                  {reference || "0123456789"}
                </Typography>
              </View>
              <TouchableOpacity
                onPress={() =>
                  handleCopy(
                    (reference as string) || "0123456789",
                    "Account Number",
                  )
                }
                className="w-10 h-10 bg-[#21262D] rounded-xl items-center justify-center"
              >
                <Feather name="copy" size={18} color="#F5E642" />
              </TouchableOpacity>
            </View>
            <View className="h-[1px] bg-[#30363D] mx-5" />

            {/* ROW 3 - BENEFICIARY */}
            <View className="flex-row items-center justify-between p-5">
              <View>
                <Typography className="text-[#8B949E] text-[10px] font-bold uppercase mb-1">
                  BENEFICIARY
                </Typography>
                <Typography className="text-white font-bold text-lg">
                  LemonPay / {user?.first_name} {user?.last_name}
                </Typography>
              </View>
              <TouchableOpacity
                onPress={() =>
                  handleCopy(
                    `LemonPay / ${user?.first_name} ${user?.last_name}`,
                    "Beneficiary",
                  )
                }
                className="w-10 h-10 bg-[#21262D] rounded-xl items-center justify-center"
              >
                <Feather name="copy" size={18} color="#F5E642" />
              </TouchableOpacity>
            </View>
          </View>

          {/* WAITING STATE ROW */}
          <View className="mt-10 items-center">
            <View className="flex-row items-center mb-4">
              <Animated.View
                className="w-3 h-3 bg-[#00C896] rounded-full mr-3"
                style={{ opacity: pulseAnim }}
              />
              <Typography className="text-[#00C896] font-bold">
                Waiting for payment...
              </Typography>
            </View>
            <View className="w-full h-[3px] bg-[#21262D] rounded-full overflow-hidden">
              <Animated.View
                style={{
                  height: 3,
                  width: 100,
                  backgroundColor: "#00C896",
                  transform: [{ translateX: shimmerAnim }],
                  borderRadius: 2,
                }}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* CONFIRM BUTTON */}
      <View className="absolute bottom-20 left-6 right-6">
        <TouchableOpacity onPress={handleConfirmed}>
          <LinearGradient
            colors={["#F5E642", "#D4C200"]}
            className="h-16 rounded-[20px] items-center justify-center"
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Typography className="text-[#0D1117] font-bold text-lg">
              I have made this transfer
            </Typography>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* TRUST BADGES ROW */}
      <View className="absolute bottom-6 left-0 right-0 flex-row justify-center space-x-6">
        <View className="flex-row items-center">
          <MaterialCommunityIcons
            name="shield-lock"
            size={14}
            color="#8B949E"
          />
          <Typography className="text-[#8B949E] text-[8px] font-bold uppercase ml-1">
            SECURE ESCROW
          </Typography>
        </View>
        <View className="flex-row items-center">
          <MaterialCommunityIcons
            name="shield-check"
            size={14}
            color="#8B949E"
          />
          <Typography className="text-[#8B949E] text-[8px] font-bold uppercase ml-1">
            NDIC INSURED
          </Typography>
        </View>
        <View className="flex-row items-center">
          <MaterialCommunityIcons
            name="lightning-bolt"
            size={14}
            color="#8B949E"
          />
          <Typography className="text-[#8B949E] text-[8px] font-bold uppercase ml-1">
            INSTANT CREDIT
          </Typography>
        </View>
      </View>

      {/* SUCCESS BOTTOM SHEET */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: "#161B22" }}
        handleIndicatorStyle={{ backgroundColor: "#30363D" }}
      >
        <BottomSheetView className="flex-1 p-6 items-center">
          <View className="w-16 h-16 bg-[#00C896]/10 rounded-full items-center justify-center mb-4">
            <MaterialCommunityIcons
              name="shield-check"
              size={40}
              color="#00C896"
            />
          </View>
          <Typography className="text-white text-xl font-bold text-center mb-2">
            We're confirming your payment
          </Typography>
          <Typography className="text-[#8B949E] text-sm text-center mb-8 px-4">
            Your wallet will be credited within a few minutes once we verify the
            transfer.
          </Typography>
          <Button
            label="Done"
            onPress={() => router.replace("/(tabs)/wallet")}
            className="w-full"
          />
        </BottomSheetView>
      </BottomSheet>
    </Screen>
  );
}
