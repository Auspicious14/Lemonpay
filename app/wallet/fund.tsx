import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Text,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import { Screen } from "@/components/ui/Screen";
import { Typography } from "@/components/ui/Typography";
import { useAuth } from "@/context/AuthContext";
import { useFundWallet } from "@/lib/hooks/useWallet";
import { useToastStore } from "@/store/useToastStore";

const QUICK_AMOUNTS = [5000, 10000, 50000, 100000, 500000];

type PaymentMethod = "bank" | "card" | "ussd";

export default function FundWalletScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { show: showToast } = useToastStore();
  const { mutateAsync: fundWallet, isPending } = useFundWallet();

  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("bank");

  const validateAmount = (amt: number): string | null => {
    if (!amt || amt <= 0) return "Please enter an amount";
    if (amt < 100) return "Minimum funding amount is ₦100";
    if (amt > 5000000) return "Maximum single funding is ₦5,000,000";
    return null;
  };

  const handleContinue = async () => {
    const amountVal = parseFloat(amount.replace(/,/g, ""));
    const error = validateAmount(amountVal);
    if (error) {
      showToast(error, "error");
      return;
    }

    try {
      const response = await fundWallet({
        amount: amountVal.toString(),
        email: user?.email || "",
      });

      if (selectedMethod === "bank") {
        router.push({
          pathname: "/wallet/bank-transfer",
          params: {
            amount: amountVal,
            reference: response.reference,
          },
        });
      } else {
        // Card or USSD
        const result = await WebBrowser.openAuthSessionAsync(
          response.authorization_url,
          "lemonpay://",
        );

        if (result.type === "success" || result.type === "dismiss") {
          // Give webhook time to process
          setTimeout(() => {
            router.replace("/(tabs)/wallet");
            showToast(
              "Transaction initiated. Your balance will update shortly.",
              "success",
            );
          }, 2000);
        }
      }
    } catch (err: any) {
      showToast(
        err.response?.data?.message || "Payment initialization failed",
        "error",
      );
    }
  };

  const formatAmount = (text: string) => {
    // Basic formatting for display if needed, but here we keep it raw for input
    setAmount(text.replace(/[^0-9]/g, ""));
  };

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

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1 px-6"
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <View className="mt-4">
            <Typography
              variant="label-sm"
              className="text-[#F5E642] tracking-[2px]"
              weight="700"
            >
              CHOOSE METHOD
            </Typography>

            <View className="mt-4 mb-8">
              <Typography
                variant="display"
                className="text-white text-[38px] leading-[44px]"
                weight="700"
              >
                Securely top up
              </Typography>
              <Typography
                variant="display"
                className="text-white text-[38px] leading-[44px]"
                weight="700"
              >
                your{" "}
                <Typography
                  variant="display"
                  className="text-[#F5E642] text-[38px]"
                  weight="700"
                >
                  escrow wallet
                </Typography>
              </Typography>
              <Typography
                variant="display"
                className="text-white text-[38px] leading-[44px]"
                weight="700"
              >
                instantly.
              </Typography>
            </View>

            {/* AMOUNT INPUT SECTION */}
            <View className="bg-[#161B22] rounded-[24px] border border-[#30363D] p-5 mb-6">
              <Typography
                variant="label-sm"
                className="text-[#8B949E] tracking-widest uppercase mb-4"
                weight="600"
              >
                ENTER AMOUNT
              </Typography>
              <View className="flex-row items-center">
                <Typography className="text-[#F5E642] text-3xl font-bold mr-2">
                  ₦
                </Typography>
                <TextInput
                  value={amount}
                  onChangeText={formatAmount}
                  placeholder="0.00"
                  placeholderTextColor="#30363D"
                  keyboardType="numeric"
                  className="flex-1 text-white text-3xl font-bold"
                  autoFocus
                />
              </View>

              {/* Quick Amounts */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mt-6 -mx-1"
              >
                {QUICK_AMOUNTS.map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    onPress={() => setAmount(amt.toString())}
                    className={`px-4 py-2 rounded-full border mr-2 ${
                      amount === amt.toString()
                        ? "bg-[#F5E642] border-[#F5E642]"
                        : "bg-[#21262D] border-[#30363D]"
                    }`}
                  >
                    <Text
                      style={{
                        color: amount === amt.toString() ? "#0D1117" : "white",
                        fontSize: 12,
                        fontWeight: "600",
                      }}
                    >
                      ₦{amt.toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* METHOD SELECTION CARDS */}
            <View className="space-y-4">
              {/* Bank Transfer */}
              <TouchableOpacity
                onPress={() => setSelectedMethod("bank")}
                className={`flex-row items-center p-5 bg-[#161B22] rounded-[24px] border ${
                  selectedMethod === "bank"
                    ? "border-[#F5E642]"
                    : "border-[#30363D]"
                }`}
              >
                <View className="w-12 h-12 bg-[#F5E642] rounded-xl items-center justify-center mr-4">
                  <MaterialCommunityIcons
                    name="bank"
                    size={24}
                    color="#0D1117"
                  />
                </View>
                <View className="flex-1">
                  <Typography className="text-white font-bold text-lg">
                    Bank Transfer
                  </Typography>
                  <Typography className="text-[#8B949E] text-xs">
                    Recommended, 0% fees
                  </Typography>
                </View>
                <View className="bg-[#003829] px-3 py-1 rounded-full">
                  <Typography className="text-[#00C896] text-[10px] font-bold uppercase">
                    FASTEST
                  </Typography>
                </View>
              </TouchableOpacity>

              {/* Card */}
              <TouchableOpacity
                onPress={() => setSelectedMethod("card")}
                className={`flex-row items-center p-5 bg-[#161B22] rounded-[24px] border ${
                  selectedMethod === "card"
                    ? "border-[#F5E642]"
                    : "border-[#30363D]"
                }`}
              >
                <View className="w-12 h-12 bg-[#21262D] rounded-xl items-center justify-center mr-4">
                  <MaterialCommunityIcons
                    name="credit-card"
                    size={24}
                    color="#8B949E"
                  />
                </View>
                <View className="flex-1">
                  <Typography className="text-white font-bold text-lg">
                    Credit/Debit Card
                  </Typography>
                  <Typography className="text-[#8B949E] text-xs">
                    Instant, 1.5% fee
                  </Typography>
                </View>
              </TouchableOpacity>

              {/* USSD */}
              <TouchableOpacity
                onPress={() => setSelectedMethod("ussd")}
                className={`flex-row items-center p-5 bg-[#161B22] rounded-[24px] border ${
                  selectedMethod === "ussd"
                    ? "border-[#F5E642]"
                    : "border-[#30363D]"
                }`}
              >
                <View className="w-12 h-12 bg-[#21262D] rounded-xl items-center justify-center mr-4">
                  <MaterialCommunityIcons
                    name="dialpad"
                    size={24}
                    color="#8B949E"
                  />
                </View>
                <View className="flex-1">
                  <Typography className="text-white font-bold text-lg">
                    USSD Code
                  </Typography>
                  <Typography className="text-[#8B949E] text-xs">
                    Quick, 1% fee
                  </Typography>
                </View>
              </TouchableOpacity>
            </View>

            {/* SECURE PAYMENT BADGE */}
            <View className="items-center mt-8 mb-8">
              <View className="flex-row items-center px-6 py-3 bg-[#21262D] border border-[#30363D] rounded-full">
                <MaterialCommunityIcons name="lock" size={16} color="#8B949E" />
                <Typography
                  className="text-[#8B949E] text-[10px] ml-2 tracking-widest uppercase"
                  weight="700"
                >
                  SECURE PAYMENT
                </Typography>
              </View>
            </View>

            {/* LEMONPAY GUARD CARD */}
            <View className="bg-[#161B22] rounded-[24px] overflow-hidden p-6 relative">
              <View className="absolute inset-0 opacity-10">
                <LinearGradient
                  colors={["transparent", "#00C896"]}
                  className="flex-1"
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
              </View>
              <View className="items-center mb-4">
                <MaterialCommunityIcons
                  name="lock"
                  size={80}
                  color="#00C896"
                  style={{ opacity: 0.6 }}
                />
              </View>
              <Typography className="text-[#F5E642] font-bold text-lg mb-1">
                LemonPay Guard
              </Typography>
              <Typography className="text-[#8B949E] text-sm">
                Your funds are protected by 256-bit encryption.
              </Typography>
            </View>
          </View>
        </ScrollView>

        {/* PROCEED BUTTON */}
        <View className="absolute bottom-10 left-6 right-6">
          <TouchableOpacity
            onPress={handleContinue}
            disabled={!amount || isPending}
            style={{ opacity: !amount || isPending ? 0.6 : 1 }}
          >
            <LinearGradient
              colors={
                !amount || isPending
                  ? ["#30363D", "#21262D"]
                  : ["#F5E642", "#D4C200"]
              }
              className="h-16 rounded-[20px] items-center justify-center flex-row"
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Typography
                className={`font-bold text-lg ${!amount || isPending ? "text-[#8B949E]" : "text-[#0D1117]"}`}
              >
                {isPending ? "Connecting..." : "Continue →"}
              </Typography>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
