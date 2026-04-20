import React from "react";
import { View, TouchableOpacity, Share, ScrollView, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Check,
  Copy,
  LayoutGrid,
  Share2,
  ShieldCheck,
} from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Typography } from "@/components/ui/Typography";
import { LinearGradient } from "expo-linear-gradient";
import * as Clipboard from "expo-clipboard";
import Animated, { ZoomIn } from "react-native-reanimated";
import { formatCurrency } from "@/lib/utils/format";

export default function WithdrawSuccessScreen() {
  const router = useRouter();
  const { amount, bank, reference } = useLocalSearchParams<{
    amount: string;
    bank: string;
    reference: string;
  }>();

  const handleCopyReference = async () => {
    if (reference) {
      await Clipboard.setStringAsync(reference);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Withdrawal of ${formatCurrency(amount || "0")} to ${bank} was successful. Reference: LP-WTH-${reference}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Screen className="bg-[#0D1117]" withPadding={false}>
      <View className="flex-row items-center px-4 pt-4 pb-2">
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/wallet")}
          className="mr-4"
        >
          <ArrowLeft size={24} color="#F5E642" />
        </TouchableOpacity>
        <Typography
          variant="subheading"
          className="!text-primary-fixed text-xl"
        >
          Withdraw Funds
        </Typography>
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{
          alignItems: "center",
          paddingTop: 40,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Hero */}
        <View className="items-center mb-10">
          <Animated.View
            entering={ZoomIn.springify()}
            className="w-[120px] h-[120px] rounded-full bg-[#00C89633] items-center justify-center"
          >
            <View className="w-[84px] h-[84px] rounded-full bg-[#00C896] items-center justify-center">
              <Check size={40} color="white" strokeWidth={3} />
            </View>
          </Animated.View>

          <Typography variant="display" className="text-white">
            Withdrawal{"\n"}Successful
          </Typography>
          <Typography
            style={{
              fontFamily: "Inter",
              fontSize: 15,
              textAlign: "center",
              marginTop: 12,
            }}
            className="text-[#8B949E]"
          >
            {formatCurrency(amount || "0")} is being sent to your {bank}{" "}
            account.
          </Typography>
        </View>

        <View className="w-full bg-[#161B22] rounded-[24px] p-5 mb-8">
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter-Bold",
                color: "#8B949E",
                fontSize: 10,
                letterSpacing: 1.5,
              }}
            >
              TRANSACTION ID
            </Text>
            <TouchableOpacity
              onPress={handleCopyReference}
              style={{
                backgroundColor: "#21262D",
                borderRadius: 20,
                paddingVertical: 6,
                paddingHorizontal: 12,
                flexDirection: "row",
                alignItems: "center",
                maxWidth: "65%", // ← never overflows
                gap: 6,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter",
                  color: "white",
                  fontSize: 12,
                  flex: 1,
                }}
                numberOfLines={1} // ← truncates with ...
                ellipsizeMode="middle" // ← "LP-WTH-09...837" looks nicer than end
              >
                {reference}
              </Text>
              <Copy size={14} color="#F5E642" />
            </TouchableOpacity>
          </View>
          <View className="h-[1px] bg-[#30363D] mb-4" />

          <View className="flex-row justify-between">
            <View>
              <Typography
                style={{ fontFamily: "Inter", fontSize: 10 }}
                className="text-[#8B949E] uppercase mb-1.5"
              >
                STATUS
              </Typography>
              <View className="bg-[#00C8961A] rounded-full py-1 px-3 flex-row items-center self-start">
                <View className="w-2 h-2 rounded-full bg-[#00C896] mr-2" />
                <Typography
                  style={{ fontFamily: "Inter-Bold", fontSize: 10 }}
                  className="text-[#00C896]"
                >
                  FUNDED
                </Typography>
              </View>
            </View>
            <View className="items-end">
              <Typography
                style={{ fontFamily: "Inter", fontSize: 10 }}
                className="text-[#8B949E] uppercase mb-1.5"
              >
                ESTIMATE
              </Typography>
              <Typography
                style={{ fontFamily: "Inter-Bold", fontSize: 14 }}
                className="text-white"
              >
                Instant
              </Typography>
            </View>
          </View>
        </View>

        <View className="w-full space-y-4 gap-2 mb-10">
          <TouchableOpacity
            onPress={() => router.replace("/home")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#F5E642", "#D9CC3C"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                height: 56,
                borderRadius: 14,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography variant="subheading" className="!text-[#0D1117] mr-2">
                Back to Dashboard
              </Typography>
              <LayoutGrid size={20} color="#0D1117" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShare}
            activeOpacity={0.8}
            className="h-14 rounded-[14px] bg-[#161B22] border border-[#30363D] flex-row justify-center items-center"
          >
            <Share2 size={20} color="white" className="mr-2" />
            <Typography
              style={{ fontFamily: "Inter-Bold", fontSize: 16 }}
              className="text-white ml-2"
            >
              Share Receipt
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="items-center">
          <View className="flex-row items-center mb-1">
            <ShieldCheck size={14} color="#8B949E" className="mr-1.5" />
            <Typography
              style={{ fontFamily: "Inter", fontSize: 10 }}
              className="text-[#8B949E]"
            >
              Securely processed by LemonPay Escrow Sentinel
            </Typography>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
