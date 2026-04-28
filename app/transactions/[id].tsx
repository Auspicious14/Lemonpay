import React from "react";
import { View, ScrollView, TouchableOpacity, Share } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Share2,
  HelpCircle,
  Download,
  FileText,
  AlertTriangle,
} from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Typography } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToastStore } from "@/store/useToastStore";

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const showToast = useToastStore((state) => state.show);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `LymePay Transaction Detail: ${id || "LP-TRANX-847291"}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleRaiseDispute = () => {
    router.push("/(tabs)/escrows");
    showToast("Select the escrow to raise a dispute", "info");
  };

  return (
    <Screen
      showBackButton
      title="Transaction Detail"
      rightAction={
        <TouchableOpacity
          onPress={handleShare}
          className="p-2 rounded-full active:bg-surface-bright/20"
        >
          <Share2 size={24} color="#f5e642" />
        </TouchableOpacity>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 pb-32">
        <View className="space-y-10 py-6">
          {/* Hero Section: Transaction Amount & Status */}
          <View className="items-center space-y-6 py-8">
            <View className="flex-row items-center px-4 py-1.5 rounded-full bg-secondary/10 border border-secondary/20">
              <View className="w-2 h-2 rounded-full bg-secondary mr-2" />
              <Typography
                variant="label-sm"
                className="text-secondary text-[10px] uppercase font-inter-extrabold tracking-[0.1em]"
              >
                SUCCESS
              </Typography>
            </View>

            <View className="items-center space-y-1">
              <Typography
                variant="caption"
                className="text-on-surface-variant font-medium"
              >
                Amount Received
              </Typography>
              <Typography
                variant="display"
                className="text-5xl font-black tracking-tight text-primary-fixed"
              >
                ₦1,250,000.00
              </Typography>
            </View>

            <View className="items-center space-y-1">
              <Typography
                variant="label-sm"
                className="text-on-surface-variant font-inter text-[10px]"
              >
                {id || "LP-TRANX-847291"}
              </Typography>
              <Typography
                variant="caption"
                className="text-on-surface-variant/60 text-[10px]"
              >
                Oct 26, 2023 • 14:22
              </Typography>
            </View>
          </View>

          {/* Detailed Information Bento Grid */}
          <View className="space-y-6">
            {/* General Summary Card */}
            <Card variant="low" className="p-8 space-y-8">
              <Typography
                variant="label-sm"
                className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant opacity-60"
              >
                General Summary
              </Typography>

              <View className="flex-row flex-wrap">
                <View className="w-1/2 space-y-1 mb-6">
                  <Typography
                    variant="caption"
                    className="text-on-surface-variant text-[10px]"
                  >
                    Transaction Type
                  </Typography>
                  <Typography variant="body" className="font-bold">
                    Escrow Funding
                  </Typography>
                </View>
                <View className="w-1/2 space-y-1 mb-6">
                  <Typography
                    variant="caption"
                    className="text-on-surface-variant text-[10px]"
                  >
                    Counterparty
                  </Typography>
                  <Typography variant="body" className="font-bold">
                    Chinedu Okafor
                  </Typography>
                </View>
                <View className="w-1/2 space-y-1">
                  <Typography
                    variant="caption"
                    className="text-on-surface-variant text-[10px]"
                  >
                    Bank Reference
                  </Typography>
                  <Typography variant="body" className="font-bold">
                    LymePay-98273
                  </Typography>
                </View>
                <View className="w-1/2 space-y-1">
                  <Typography
                    variant="caption"
                    className="text-on-surface-variant text-[10px]"
                  >
                    Asset Category
                  </Typography>
                  <Typography variant="body" className="font-bold">
                    Digital Goods
                  </Typography>
                </View>
              </View>
            </Card>

            {/* Financial Breakdown Card */}
            <Card
              variant="default"
              className="p-8 relative overflow-hidden bg-surface-container border border-outline-variant/5"
            >
              <View
                className="absolute top-[-48px] right-[-48px] w-48 h-48 bg-primary-fixed/5 rounded-full"
                style={{ filter: "blur(32px)" }}
              />

              <Typography
                variant="label-sm"
                className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant opacity-60 mb-8 block"
              >
                Financial Breakdown
              </Typography>

              <View className="space-y-4">
                <View className="flex-row justify-between items-center">
                  <Typography
                    variant="body"
                    className="text-on-surface-variant"
                  >
                    Purchase Price
                  </Typography>
                  <Typography variant="body" className="font-bold">
                    ₦1,250,000.00
                  </Typography>
                </View>
                <View className="flex-row justify-between items-center">
                  <Typography
                    variant="body"
                    className="text-on-surface-variant"
                  >
                    Escrow Fee (0.5%)
                  </Typography>
                  <Typography variant="body" className="font-bold">
                    ₦6,250.00
                  </Typography>
                </View>
                <View className="flex-row justify-between items-center">
                  <Typography
                    variant="body"
                    className="text-on-surface-variant"
                  >
                    Network Charge
                  </Typography>
                  <Typography variant="body" className="font-bold">
                    ₦150.00
                  </Typography>
                </View>
                <View className="pt-6 border-t border-outline-variant/20 flex-row justify-between items-center">
                  <Typography variant="subheading" className="font-bold">
                    Total Amount
                  </Typography>
                  <Typography
                    variant="display"
                    className="text-2xl font-extrabold text-primary-fixed"
                  >
                    ₦1,256,400.00
                  </Typography>
                </View>
              </View>
            </Card>

            {/* Support Section */}
            <TouchableOpacity
              onPress={handleRaiseDispute}
              className="p-6 bg-surface-container-high/40 rounded-3xl flex-row items-center justify-between border border-outline-variant/10 active:scale-95 transition-all"
            >
              <View className="flex-row items-center space-x-4">
                <View className="w-10 h-10 rounded-xl bg-surface-bright items-center justify-center">
                  <HelpCircle size={18} color="#d8ca23" />
                </View>
                <View>
                  <Typography variant="body" className="font-bold text-sm">
                    Need assistance?
                  </Typography>
                  <Typography
                    variant="caption"
                    className="text-text-secondary text-[11px]"
                  >
                    Dispute resolution available 24/7
                  </Typography>
                </View>
              </View>
              <Typography
                variant="label-sm"
                className="text-primary-fixed font-bold text-[10px] uppercase tracking-wider"
              >
                Raise Dispute
              </Typography>
            </TouchableOpacity>
          </View>

          {/* Main Actions */}
          <View className="space-y-4 pt-6 pb-20">
            <Button
              label="Download Receipt"
              onPress={() => {}}
              leftIcon={<Download size={20} color="#1f1c00" />}
              className="h-16 shadow-2xl shadow-primary-fixed/20"
            />
            <TouchableOpacity className="w-full flex-row items-center justify-center space-x-2 h-16 bg-transparent border border-outline-variant/30 rounded-2xl active:bg-surface-container transition-colors">
              <FileText size={20} color="#ffffff" />
              <Typography variant="body" className="font-bold">
                View Escrow Agreement
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
