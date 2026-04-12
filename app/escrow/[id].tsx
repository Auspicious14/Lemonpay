import React from "react";
import { View, ScrollView, TouchableOpacity, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ShieldCheck,
  ArrowLeft,
  Bell,
  User,
  Store,
  Verified,
  LockOpen,
  Gavel,
  Info,
  Truck,
  Package,
  ExternalLink,
  MessageSquare,
} from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Typography } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StepIndicator, EscrowStep } from "@/components/ui/StepIndicator";

export default function EscrowDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  return (
    <Screen
      showBackButton
      title="Escrow Details"
      rightAction={
        <TouchableOpacity className="active:scale-95 transition-transform">
          <Bell size={24} color="#f5e642" />
        </TouchableOpacity>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 pb-32">
        <View className="space-y-10 py-6">
          {/* Hero Section: Bento Style */}
          <View className="space-y-6">
            <Card
              variant="low"
              className="p-8 relative overflow-hidden min-h-[180px]"
            >
              <View className="absolute top-4 right-4 z-10">
                <View className="bg-secondary/10 px-4 py-1.5 rounded-full border border-secondary/20">
                  <Typography
                    variant="label-sm"
                    className="text-secondary text-[10px] font-inter-extrabold uppercase tracking-widest"
                  >
                    Funded
                  </Typography>
                </View>
              </View>

              <View className="space-y-4">
                <Typography
                  variant="label-sm"
                  className="text-text-secondary uppercase tracking-widest text-[10px]"
                >
                  Transaction ID: {id || "LP-9023411"}
                </Typography>
                <Typography
                  variant="display"
                  className="text-3xl tracking-tight"
                >
                  iPhone 15 Pro Max
                </Typography>
                <Typography
                  variant="display"
                  className="text-5xl text-primary-fixed"
                >
                  ₦1,200,000
                </Typography>

                <View className="flex-row items-center space-x-2 pt-2">
                  <ShieldCheck size={14} color="#43e5b1" fill="#43e5b1" />
                  <Typography
                    variant="caption"
                    className="text-secondary font-bold text-[10px] uppercase tracking-[0.1em]"
                  >
                    Secure by LemonPay
                  </Typography>
                </View>
              </View>
            </Card>

            <Card
              variant="default"
              className="p-8 space-y-6 flex-row justify-between items-center border border-outline-variant/10"
            >
              <View className="flex-1 space-y-4">
                <View className="flex-row items-center space-x-4">
                  <View className="w-10 h-10 rounded-2xl bg-surface-container-high items-center justify-center">
                    <User size={18} color="#f5e642" />
                  </View>
                  <View>
                    <Typography
                      variant="label-sm"
                      className="text-text-secondary text-[8px] uppercase tracking-widest"
                    >
                      Buyer
                    </Typography>
                    <View className="flex-row items-center space-x-1">
                      <Typography variant="body" className="font-bold">
                        Chidi O.
                      </Typography>
                      <Verified size={12} color="#43e5b1" fill="#43e5b1" />
                    </View>
                  </View>
                </View>
                <View className="h-[1px] bg-outline-variant/5 w-full" />
                <View className="flex-row items-center space-x-4">
                  <View className="w-10 h-10 rounded-2xl bg-surface-container-high items-center justify-center">
                    <Store size={18} color="#f5e642" />
                  </View>
                  <View>
                    <Typography
                      variant="label-sm"
                      className="text-text-secondary text-[8px] uppercase tracking-widest"
                    >
                      Seller
                    </Typography>
                    <View className="flex-row items-center space-x-1">
                      <Typography variant="body" className="font-bold">
                        Gadget Hub Lagos
                      </Typography>
                      <Verified size={12} color="#43e5b1" fill="#43e5b1" />
                    </View>
                  </View>
                </View>
              </View>
            </Card>
          </View>

          {/* Details & Timeline */}
          <View className="flex-row space-x-8">
            {/* Timeline Section */}
            <View className="flex-1 space-y-6">
              <Typography variant="heading" className="text-lg">
                Escrow Journey
              </Typography>
              <Card variant="low" className="p-8 pb-10">
                <StepIndicator currentStep="delivered" vertical />
              </Card>
            </View>

            {/* Description & Action column simulation for tablet, or stacked for mobile */}
          </View>

          {/* Item Description Section */}
          <View className="space-y-6">
            <Typography variant="heading" className="text-lg">
              Item Summary
            </Typography>
            <Card
              variant="default"
              className="p-8 space-y-8 border border-outline-variant/10"
            >
              <View>
                <Typography
                  variant="body"
                  className="text-text-secondary leading-relaxed"
                >
                  iPhone 15 Pro Max, 256GB, Natural Titanium. Brand new in box,
                  factory unlocked with 1-year Apple Warranty. Includes original
                  invoice and accessories.
                </Typography>
              </View>

              <View className="flex-row space-x-4">
                <Card
                  variant="low"
                  className="flex-1 p-4 border border-outline-variant/5"
                >
                  <Typography
                    variant="label-sm"
                    className="text-text-secondary text-[8px] uppercase font-bold mb-1"
                  >
                    Carrier
                  </Typography>
                  <Typography variant="body" className="font-semibold text-sm">
                    DHL Express
                  </Typography>
                </Card>
                <Card
                  variant="low"
                  className="flex-1 p-4 border border-outline-variant/5"
                >
                  <Typography
                    variant="label-sm"
                    className="text-text-secondary text-[8px] uppercase font-bold mb-1"
                  >
                    Tracking
                  </Typography>
                  <Typography
                    variant="body"
                    className="font-semibold text-primary-fixed text-sm"
                  >
                    DHL-8829-001
                  </Typography>
                </Card>
              </View>

              <View className="space-y-4 pt-4 border-t border-outline-variant/10">
                <Button
                  label="Confirm Delivery"
                  onPress={() => {}}
                  leftIcon={<LockOpen size={20} color="#1f1c00" />}
                  className="h-16 shadow-2xl shadow-primary-fixed/20"
                />
                <TouchableOpacity className="flex-row items-center justify-center space-x-2 h-14 bg-transparent border border-outline-variant/30 rounded-2xl active:bg-surface-container">
                  <Gavel size={18} color="#ffb4ab" />
                  <Typography
                    variant="body"
                    className="font-bold text-accent-danger"
                  >
                    Raise Dispute
                  </Typography>
                </TouchableOpacity>
              </View>
            </Card>
          </View>

          {/* Trust Signal */}
          <View className="flex-row items-center space-x-4 bg-surface-container-lowest/50 rounded-2xl p-6 border border-outline-variant/10">
            <View className="w-12 h-12 rounded-full bg-secondary/10 items-center justify-center">
              <ShieldCheck size={24} color="#43e5b1" fill="#43e5b1" />
            </View>
            <View className="flex-1 space-y-1">
              <Typography variant="body" className="font-bold">
                LemonPay Protection Active
              </Typography>
              <Typography
                variant="caption"
                className="text-text-secondary text-[11px] leading-snug"
              >
                Your funds are protected by 256-bit encryption and our secure
                multi-sig protocol.
              </Typography>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Chat Action */}
      <TouchableOpacity className="absolute bottom-32 right-6 w-16 h-16 bg-primary-fixed rounded-2xl items-center justify-center shadow-2xl shadow-primary-fixed/30 active:scale-95 transition-transform z-40">
        <MessageSquare size={28} color="#1f1c00" fill="#1f1c00" />
      </TouchableOpacity>
    </Screen>
  );
}
