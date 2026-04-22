import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Share,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  MoreVertical,
  ShieldCheck,
  Wallet as WalletIcon,
  Clock,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Screen } from "@/components/ui/Screen";
import { Typography } from "@/components/ui/Typography";
import { useDisputeDetail } from "@/lib/hooks/useDisputes";
import { useEscrowDetail } from "@/lib/hooks/useEscrow";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const LEMON_YELLOW = "#F5E642";
const DARK_BG = "#161B22";
const CARD_BG = "#161B22";
const BORDER_COLOR = "#30363D";
const TEAL = "#00C896";

export default function ResolutionReachedScreen() {
  const { uuid } = useLocalSearchParams<{ uuid: string }>();
  const router = useRouter();

  const { data: dispute, isLoading: isDisputeLoading } = useDisputeDetail(uuid || "");
  const { data: escrow, isLoading: isEscrowLoading } = useEscrowDetail(dispute?.escrow_uuid || "");

  const [selectedEmoji, setSelectedEmoji] = useState<number | null>(null);

  const handleDownloadReceipt = async () => {
    try {
      await Share.share({
        message: `LymePay Dispute Resolution\nCase ID: #${uuid?.substring(0, 8).toUpperCase()}\nAmount: ₦${parseFloat(escrow?.amount || "0").toLocaleString()}\nStatus: Full Refund Approved`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (isDisputeLoading || isEscrowLoading || !dispute) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <LoadingSpinner />
        </View>
      </Screen>
    );
  }

  const amountFormatted = `₦${parseFloat(escrow?.amount || "0").toLocaleString()}`;

  const emojis = [
    { id: 1, char: "😤" },
    { id: 2, char: "😐" },
    { id: 3, char: "😄" },
  ];

  return (
    <Screen>
      <View className="px-4 py-2 flex-row items-center justify-between">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="flex-row items-center"
        >
          <ArrowLeft size={20} color={LEMON_YELLOW} />
          <Typography 
            style={{ fontFamily: "Inter-Bold" }}
            className="text-[#F5E642] ml-2 text-sm"
          >
            Dispute Center
          </Typography>
        </TouchableOpacity>
        <TouchableOpacity>
          <MoreVertical size={20} color="#8B949E" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View className="mt-10 items-center justify-center">
          <View 
            style={{ backgroundColor: "rgba(0,200,150,0.15)" }}
            className="w-20 h-20 rounded-full items-center justify-center mb-6"
          >
            <ShieldCheck size={40} color={TEAL} />
          </View>
          
          <Typography 
            style={{ fontFamily: "Inter-ExtraBold" }}
            className="text-white text-[34px] text-center leading-tight px-4"
          >
            Resolution Reached
          </Typography>

          <View className="bg-[#00C896] px-4 py-1.5 rounded-full mt-4">
            <Typography 
              style={{ fontFamily: "Inter-Bold" }}
              className="text-black text-[10px] uppercase font-bold"
            >
              Full Refund Approved
            </Typography>
          </View>
        </View>

        {/* Refund Summary Card */}
        <View 
          style={{ backgroundColor: CARD_BG }}
          className="mt-10 p-5 rounded-2xl border border-[#30363D] relative overflow-hidden"
        >
          <View className="absolute -right-4 -bottom-4 opacity-[0.08]">
            <WalletIcon size={120} color="white" />
          </View>

          <Typography 
            style={{ fontFamily: "Inter-Bold" }}
            className="text-gray-500 text-[10px] uppercase tracking-widest"
          >
            Refund Summary
          </Typography>
          
          <Typography 
            style={{ fontFamily: "Inter-Bold" }}
            className="text-white text-4xl mt-2"
          >
            {amountFormatted}
          </Typography>
          <Typography 
            style={{ fontFamily: "Inter" }}
            className="text-gray-500 text-xs mt-1"
          >
            Amount to be refunded
          </Typography>

          <View className="h-[1px] bg-[#30363D] my-6" />

          <View className="flex-row items-center">
            <View className="bg-[#21262D] p-2.5 rounded-xl mr-4">
              <Clock size={20} color={LEMON_YELLOW} />
            </View>
            <View className="flex-1">
              <Typography 
                style={{ fontFamily: "Inter-Bold" }}
                className="text-white text-base"
              >
                Next Steps
              </Typography>
              <Typography 
                style={{ fontFamily: "Inter" }}
                className="text-gray-500 text-xs mt-0.5 leading-4"
              >
                Funds will reflect in your LymePay wallet within 30 minutes.
              </Typography>
            </View>
          </View>
        </View>

        {/* Feedback Section */}
        <View className="mt-12 items-center">
          <Typography 
            style={{ fontFamily: "Inter-Bold" }}
            className="text-white text-base text-center"
          >
            How was your dispute experience?
          </Typography>

          <View className="flex-row mt-6 gap-6">
            {emojis.map((emoji) => (
              <TouchableOpacity
                key={emoji.id}
                onPress={() => setSelectedEmoji(emoji.id)}
                activeOpacity={0.7}
                style={{ 
                  backgroundColor: "#21262D", 
                  borderColor: selectedEmoji === emoji.id ? LEMON_YELLOW : BORDER_COLOR,
                  borderWidth: 1 
                }}
                className="w-14 h-14 rounded-full items-center justify-center"
              >
                <Typography className="text-2xl">{emoji.char}</Typography>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* CTA Buttons */}
        <View className="mt-12">
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)/wallet")}
          >
            <LinearGradient
              colors={["#F5E642", "#D9CC3B"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="h-14 rounded-2xl items-center justify-center flex-row"
            >
              <Typography 
                style={{ fontFamily: "Inter-Bold" }}
                className="text-black text-base font-bold"
              >
                View Wallet
              </Typography>
              <Typography className="text-black ml-2 text-xl">→</Typography>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDownloadReceipt}
            className="h-14 rounded-2xl items-center justify-center mt-2"
          >
            <Typography 
              style={{ fontFamily: "Inter-Bold" }}
              className="text-white text-base"
            >
              Download Receipt
            </Typography>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Screen>
  );
}
