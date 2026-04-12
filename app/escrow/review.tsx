import React from "react";
import { View, ScrollView, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import {
  ShieldCheck,
  ArrowRight,
  Send,
  Edit3,
  User,
  Verified,
  Info,
  Timer,
  Gavel,
  Check,
  Wallet as WalletIcon,
} from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Typography } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function ReviewEscrowScreen() {
  const router = useRouter();

  const handleConfirm = () => {
    router.push("/escrow/success");
  };

  return (
    <Screen
      showBackButton
      title="Review Agreement"
      rightAction={
        <Typography
          variant="label-sm"
          className="text-text-secondary uppercase tracking-widest"
        >
          Step 3 of 3
        </Typography>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 pb-32">
        <View className="space-y-10 py-6">
          <View className="space-y-4">
            <Typography
              variant="display-lg"
              className="tracking-tight leading-none"
            >
              Review {"\n"}Agreement
            </Typography>
            <Typography
              variant="body"
              className="text-text-secondary leading-relaxed"
            >
              Ensure all parameters and terms are correct. Once submitted, the
              seller will perform a final review.
            </Typography>
          </View>

          {/* Transaction Overview Bento */}
          <View className="flex-row space-x-4">
            <Card
              variant="low"
              className="flex-1 p-6 justify-between min-h-[160px]"
            >
              <Typography
                variant="label-sm"
                className="text-text-secondary uppercase tracking-widest text-[10px]"
              >
                Total Amount
              </Typography>
              <View className="mt-4">
                <Typography
                  variant="display"
                  className="text-3xl text-primary-fixed"
                >
                  ₦450,000.00
                </Typography>
                <View className="bg-secondary/10 px-2 py-1 rounded self-start mt-2">
                  <Typography
                    variant="label-sm"
                    className="text-secondary text-[8px] uppercase font-inter-extrabold tracking-widest"
                  >
                    Secured by LemonPay
                  </Typography>
                </View>
              </View>
            </Card>
            <Card
              variant="low"
              className="flex-1 p-6 justify-between min-h-[160px]"
            >
              <Typography
                variant="label-sm"
                className="text-text-secondary uppercase tracking-widest text-[10px]"
              >
                Counterparty
              </Typography>
              <View className="mt-4 flex-row items-center space-x-3">
                <View className="w-10 h-10 rounded-full bg-surface-container-high items-center justify-center">
                  <User size={20} color="#f5e642" />
                </View>
                <View>
                  <Typography variant="body" className="font-bold">
                    Ibrahim K.
                  </Typography>
                  <Typography
                    variant="caption"
                    className="text-secondary text-[10px] font-bold"
                  >
                    Verified Merchant
                  </Typography>
                </View>
              </View>
            </Card>
          </View>

          {/* Asset Detail Card */}
          <Card
            variant="default"
            className="p-1 overflow-hidden border border-outline-variant/10"
          >
            <View className="flex-row gap-4 p-5 bg-surface-container-low rounded-xl">
              <View className="w-32 h-32 rounded-lg overflow-hidden bg-surface-container-high">
                <Image
                  source={{
                    uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuCBappIHWJh4cABg1WeC2oRp6cJ05JXgHvcWCiR3eRB-HKFmBURy2HGjvzYZedl2O0FhI5PadJyMxZQRlPj8SzOrdUcVNrpi-zMunm6VQZZ1vnnnTLGiJbwubROEQHrzjqFWrqSyxStnt2OeRkPcvsGXsecVq08hKpE791RBXinfIm2Y2giuM4Iq3jJ4YgHKHqFuBzAPQvSZCDBVU4wBGMptHTWBcK5h4pOEyrF2stE0IOigOfdRN6P0hLFvwqJhWgSzLw1gC496QZy",
                  }}
                  className="w-full h-full object-cover"
                />
              </View>
              <View className="flex-1 space-y-2 py-1">
                <View className="bg-secondary/10 px-3 py-1 rounded-full self-start">
                  <Typography
                    variant="label-sm"
                    className="text-secondary text-[8px] uppercase font-inter-extrabold tracking-widest"
                  >
                    Asset Purchase
                  </Typography>
                </View>
                <Typography variant="subheading" className="text-xl font-bold">
                  2023 MacBook Pro M3 Max
                </Typography>
                <Typography
                  variant="caption"
                  className="text-text-secondary text-[11px] leading-relaxed"
                  numberOfLines={3}
                >
                  16-inch, 64GB RAM, 2TB SSD. Pristine condition with original
                  packaging.
                </Typography>
              </View>
            </View>
          </Card>

          {/* Agreement Terms Section */}
          <View className="space-y-6">
            <View className="flex-row items-center space-x-2 px-2">
              <Gavel size={16} color="#f5e642" />
              <Typography
                variant="label-sm"
                className="text-white font-inter-extrabold uppercase tracking-widest"
              >
                Escrow Terms
              </Typography>
            </View>

            <Card
              variant="low"
              className="p-8 space-y-6 border-l-4 border-primary-fixed"
            >
              {[
                {
                  id: "01",
                  title: "Inspection Period",
                  body: "Buyer has exactly 48 hours for item verification after confirmed delivery.",
                },
                {
                  id: "02",
                  title: "Release Conditions",
                  body: "Funds will be released only upon explicit confirmation by Buyer.",
                },
                {
                  id: "03",
                  title: "Dispute Resolution",
                  body: "Independent LemonPay arbitration team will review evidence within 24 hours if needed.",
                },
              ].map((term, i) => (
                <View key={term.id} className="flex-row space-x-4">
                  <Typography
                    variant="heading"
                    className="text-primary-fixed font-black text-lg"
                  >
                    {term.id}
                  </Typography>
                  <View className="flex-1">
                    <Typography variant="body" className="font-bold mb-1">
                      {term.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      className="text-text-secondary leading-relaxed"
                    >
                      {term.body}
                    </Typography>
                  </View>
                </View>
              ))}
            </Card>
          </View>

          {/* Action Area */}
          <View className="space-y-6 pt-4">
            <View className="flex-row items-start space-x-4 bg-primary-fixed/5 p-6 rounded-2xl border border-primary-fixed/10">
              <Info size={20} color="#f5e642" />
              <Typography
                variant="caption"
                className="text-text-secondary italic leading-relaxed"
              >
                The seller will review and suggest modifications before
                confirmation. No funds will be moved until the final handshake.
              </Typography>
            </View>

            <View className="space-y-4">
              <Button
                label="Send to Seller"
                onPress={handleConfirm}
                rightIcon={<Send size={20} color="#1f1c00" />}
                className="h-16 shadow-2xl shadow-primary-fixed/20"
              />
              <TouchableOpacity className="flex-row items-center justify-center space-x-2 h-14 bg-transparent border border-outline-variant/20 rounded-2xl active:bg-surface-container">
                <Edit3 size={18} color="#ffffff" />
                <Typography variant="body" className="font-bold">
                  Edit Agreement
                </Typography>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
