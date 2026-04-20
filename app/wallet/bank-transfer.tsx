import React, { useEffect, useRef, useMemo, useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  TextInput,
  ActivityIndicator,
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
import { useFundWallet } from "@/lib/hooks/useWallet";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Button } from "@/components/ui/Button";

const { width } = Dimensions.get("window");

const QUICK_AMOUNTS = [5000, 10000, 20000, 50000];

export default function BankTransferScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { show: showToast } = useToastStore();
  const { mutateAsync: fundWallet, isPending } = useFundWallet();

  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["35%"], []);

  // Animation for green pulse
  const pulseAnim = useRef(new Animated.Value(0.5)).current;
  // Animation for shimmer
  const shimmerAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (step === 2) {
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
    }
  }, [step]);

  const handleInitialize = async () => {
    const amountVal = parseFloat(amount.replace(/[^0-9]/g, ""));
    if (!amountVal || amountVal < 100) {
      showToast("Minimum funding is ₦100", "error");
      return;
    }

    try {
      const result = await fundWallet({
        amount: amountVal.toString(),
        email: user?.email || "",
      });
      setReference(result.reference);
      setStep(2);
    } catch (err: any) {
      showToast(
        err.response?.data?.message || "Failed to initialize transfer",
        "error",
      );
    }
  };

  const handleCopy = async (value: string, label: string) => {
    await Clipboard.setStringAsync(value);
    showToast(`${label} copied!`, "success");
  };

  const handleConfirmed = () => {
    bottomSheetRef.current?.expand();
  };

  const NigeriaAmount = parseFloat(amount || "0").toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const renderStep1 = () => (
    <View className="mt-6">
      <Typography variant="display" className="mb-4">
        Enter Amount
      </Typography>
      <Typography
        style={{ fontFamily: "Inter" }}
        className="text-[#8B949E] text-base leading-[22px] mb-8"
      >
        How much would you like to fund your wallet with via bank transfer?
      </Typography>

      <View className="bg-[#161B22] rounded-[24px] border border-[#30363D] p-6 mb-8">
        <View className="flex-row items-center">
          <Typography
            style={{ fontFamily: "Inter-Bold" }}
            className="text-[#F5E642] text-3xl font-bold mr-2"
          >
            ₦
          </Typography>
          <TextInput
            value={
              amount
                ? parseInt(amount.replace(/[^0-9]/g, "")).toLocaleString(
                    "en-NG",
                  )
                : ""
            }
            onChangeText={(text) => setAmount(text.replace(/[^0-9]/g, ""))}
            placeholder="0.00"
            placeholderTextColor="#30363D"
            keyboardType="numeric"
            className="flex-1 text-white text-4xl font-bold"
            autoFocus
          />
        </View>
      </View>

      <View className="flex-row flex-wrap gap-3 mb-8">
        {QUICK_AMOUNTS.map((amt) => (
          <TouchableOpacity
            key={amt}
            onPress={() => setAmount(amt.toString())}
            className={`px-6 py-3 rounded-full border ${
              amount === amt.toString()
                ? "bg-[#F5E642] border-[#F5E642]"
                : "bg-[#21262D] border-[#30363D]"
            }`}
          >
            <Typography
              style={{
                fontFamily: "Inter-Bold",
                color: amount === amt.toString() ? "#0D1117" : "white",
              }}
            >
              ₦{amt.toLocaleString()}
            </Typography>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity onPress={handleInitialize} disabled={isPending}>
        <LinearGradient
          colors={["#F5E642", "#D4C200"]}
          style={{
            height: 56,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
          }}
        >
          {isPending ? (
            <ActivityIndicator color="#0D1117" />
          ) : (
            <Typography
              style={{ fontFamily: "Inter-Bold" }}
              className="!text-[#0D1117] text-lg"
            >
              Generate Transfer Details
            </Typography>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View className="mt-6">
      <Typography variant="display" className="!text-white mb-4" weight="700">
        Bank Transfer
      </Typography>
      <Typography
        style={{ fontFamily: "Inter" }}
        className="text-[#8B949E] text-base leading-[22px] mb-8"
      >
        Transfer the exact amount to the account below. Your wallet will be
        credited instantly.
      </Typography>

      {/* TRANSFER AMOUNT CARD */}
      <View className="bg-[#1C2128] rounded-[24px] p-6 items-center justify-center mb-6">
        <Typography
          variant="label"
          className="!text-[#F5E642] mb-1"
          weight="700"
        >
          TRANSFER AMOUNT
        </Typography>
        <Typography variant="display" className="!text-white mb-4" weight="700">
          ₦{NigeriaAmount}
        </Typography>
      </View>

      {/* BANK DETAILS CARD */}
      <View className="bg-[#161B22] rounded-[24px] border border-[#30363D] overflow-hidden">
        {/* ROW 1 - BANK NAME */}
        <View className="flex-row items-center justify-between p-5">
          <View>
            <Typography
              variant="label"
              className="!text-[#8B949E] mb-1"
              weight="700"
            >
              BANK NAME
            </Typography>
            <Typography variant="body" className="!text-white" weight="700">
              Wema Bank (LymePay)
            </Typography>
          </View>
          <TouchableOpacity
            onPress={() => handleCopy("Wema Bank (LymePay)", "Bank Name")}
            className="w-10 h-10 bg-[#21262D] rounded-xl items-center justify-center"
          >
            <Feather name="copy" size={18} color="#F5E642" />
          </TouchableOpacity>
        </View>
        <View className="h-[1px] bg-[#30363D] mx-5" />

        {/* ROW 2 - ACCOUNT NUMBER */}
        <View className="flex-row items-center justify-between p-5">
          <View>
            <Typography
              variant="label"
              className="!text-[#8B949E] mb-1"
              weight="700"
            >
              ACCOUNT NUMBER
            </Typography>
            <Typography
              variant="body"
              className="!text-white"
              weight="700"
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
            <Typography
              variant="label"
              className="!text-[#8B949E] mb-1"
              weight="700"
            >
              BENEFICIARY
            </Typography>
            <Typography variant="body" className="!text-white" weight="700">
              LymePay / {user?.first_name} {user?.last_name}
            </Typography>
          </View>
          <TouchableOpacity
            onPress={() =>
              handleCopy(
                `LymePay / ${user?.first_name} ${user?.last_name}`,
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
          <Typography
            style={{ fontFamily: "Inter-Bold" }}
            className="text-[#00C896] font-bold"
          >
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

      {/* CONFIRM BUTTON */}
      <View style={{ marginTop: 40, marginBottom: 40 }}>
        <TouchableOpacity onPress={handleConfirmed}>
          <LinearGradient
            colors={["#F5E642", "#D4C200"]}
            className="h-16 !rounded-[20px] items-center justify-center"
            style={{ borderRadius: 12 }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Typography variant="body" className="!text-black" weight="700">
              I have made this transfer
            </Typography>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Screen withPadding={false}>
      <View className="flex-row items-center justify-between px-6 py-4 bg-[#0D1117]">
        <View className="flex gap-4 items-center flex-row">
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back-ios" size={24} color="#F5E642" />
          </TouchableOpacity>
          <Typography variant="body" className="!text-[#F5E642]" weight="700">
            Fund Wallet
          </Typography>
        </View>
        <Typography variant="body" className="!text-[#F5E642]" weight="800">
          LYMEPAY
        </Typography>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 150 }}
      >
        {step === 1 ? renderStep1() : renderStep2()}
      </ScrollView>

      {/* TRUST BADGES ROW */}
      <View className="absolute bottom-6 left-0 right-0 flex-row justify-center space-x-6">
        <View className="flex-row items-center">
          <MaterialCommunityIcons
            name="shield-lock"
            size={14}
            color="#8B949E"
          />
          <Typography
            style={{ fontFamily: "Inter-Bold" }}
            className="text-[#8B949E] text-[8px] font-bold uppercase ml-1"
          >
            SECURE ESCROW
          </Typography>
        </View>
        <View className="flex-row items-center">
          <MaterialCommunityIcons
            name="shield-check"
            size={14}
            color="#8B949E"
          />
          <Typography
            style={{ fontFamily: "Inter-Bold" }}
            className="text-[#8B949E] text-[8px] font-bold uppercase ml-1"
          >
            NDIC INSURED
          </Typography>
        </View>
        <View className="flex-row items-center">
          <MaterialCommunityIcons
            name="lightning-bolt"
            size={14}
            color="#8B949E"
          />
          <Typography
            style={{ fontFamily: "Inter-Bold" }}
            className="text-[#8B949E] text-[8px] font-bold uppercase ml-1"
          >
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
          <Typography
            variant="body"
            className="!text-[#F5E642] mb-2"
            weight="700"
          >
            We're confirming your payment
          </Typography>
          <Typography
            variant="caption"
            className="!text-[#8B949E] text-center mb-8 px-4"
          >
            Your wallet will be credited within a few minutes once we verify the
            transfer.
          </Typography>
          <Button
            label="Done"
            onPress={() => router.replace("/(tabs)/wallet")}
            variant="primary"
            className="rounded-md"
            fullWidth
          />
        </BottomSheetView>
      </BottomSheet>
    </Screen>
  );
}
